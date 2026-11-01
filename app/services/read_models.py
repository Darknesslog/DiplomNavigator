"""Scoped database projections for dashboard and application screens."""

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models import (
    Application,
    ApplicationStatus,
    Assignment,
    AssignmentStatus,
    Department,
    Student,
    Teacher,
    Topic,
    User,
    UserRole,
)
from app.schemas.application import StudentApplicationResponse
from app.schemas.dashboard import (
    AssignmentDetail,
    HeadDashboard,
    StudentDetail,
    SupervisorDashboard,
    SupervisorWorkload,
    TopicCounts,
)
from app.schemas.presentation import StudentSummary
from app.services.accounts import check_department_scope, require_department
from app.services.application import expire_overdue_applications
from app.services.supervisor import require_supervisor_profile


def refresh_expired_applications(db: Session) -> None:
    """Apply the existing lazy timeout before rendering dashboard counters."""
    if expire_overdue_applications(db):
        db.commit()


def application_query():
    """Load only the relationships needed by the public application contract."""
    return select(Application).options(
        selectinload(Application.student).selectinload(Student.user),
        selectinload(Application.student).selectinload(Student.group),
        selectinload(Application.topic),
    )


def assignment_query():
    """Load students and topic cards together to avoid a query per row."""
    return select(Assignment).options(
        selectinload(Assignment.student).selectinload(Student.user),
        selectinload(Assignment.student).selectinload(Student.group),
        selectinload(Assignment.topic),
    )


def visible_applications(
    db: Session,
    actor: User,
    status_filter: ApplicationStatus | None,
    offset: int,
    limit: int,
) -> list[StudentApplicationResponse]:
    """Students see their own requests; supervisors own topics; heads their department."""
    refresh_expired_applications(db)
    statement = application_query().join(Application.topic)
    if actor.role == UserRole.STUDENT:
        if actor.student is None:
            raise HTTPException(status_code=409, detail="Student profile is required")
        statement = statement.where(Application.student_id == actor.student.id)
    elif actor.role == UserRole.NAUCHRUK:
        teacher = require_supervisor_profile(actor)
        statement = statement.where(Topic.supervisor_id == teacher.id)
    elif actor.role == UserRole.ZAVKAF:
        teacher = require_supervisor_profile(actor)
        statement = statement.where(Topic.department_id == teacher.department_id)
    elif actor.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Insufficient role")
    if status_filter is not None:
        statement = statement.where(Application.status == status_filter)
    return [
        StudentApplicationResponse.model_validate(row)
        for row in db.scalars(
            statement.order_by(Application.created_at.desc(), Application.id.desc())
            .offset(offset)
            .limit(limit)
        )
    ]


def supervisor_assignments(
    db: Session,
    actor: User,
    offset: int,
    limit: int,
    status_filter: AssignmentStatus | None = None,
) -> list[AssignmentDetail]:
    """Read only assignments owned by the caller, including completed history."""
    teacher = require_supervisor_profile(actor)
    statement = assignment_query().where(Assignment.supervisor_id == teacher.id)
    if status_filter is not None:
        statement = statement.where(Assignment.status == status_filter)
    return [
        AssignmentDetail.model_validate(row)
        for row in db.scalars(
            statement.order_by(Assignment.assigned_at.desc(), Assignment.id.desc())
            .offset(offset)
            .limit(limit)
        )
    ]


def supervisor_assignment(db: Session, actor: User, assignment_id: int) -> AssignmentDetail:
    """Use an ownership-filtered lookup; other supervisors' IDs are not disclosed."""
    teacher = require_supervisor_profile(actor)
    row = db.scalar(
        assignment_query().where(
            Assignment.id == assignment_id, Assignment.supervisor_id == teacher.id
        )
    )
    if row is None:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return AssignmentDetail.model_validate(row)


def supervisor_students(
    db: Session,
    actor: User,
    offset: int,
    limit: int,
) -> list[StudentSummary]:
    """List students with a noncancelled assignment to this supervisor."""
    teacher = require_supervisor_profile(actor)
    owned_students = select(Assignment.student_id).where(
        Assignment.supervisor_id == teacher.id,
        Assignment.status != AssignmentStatus.CANCELLED,
    )
    statement = (
        select(Student)
        .where(Student.id.in_(owned_students))
        .options(selectinload(Student.user), selectinload(Student.group))
    )
    return [
        StudentSummary.model_validate(row)
        for row in db.scalars(statement.order_by(Student.id).offset(offset).limit(limit))
    ]


def supervisor_student(db: Session, actor: User, student_id: int) -> StudentDetail:
    """Never return assignments belonging to a different supervisor on a student card."""
    teacher = require_supervisor_profile(actor)
    rows = list(
        db.scalars(
            assignment_query()
            .where(
                Assignment.student_id == student_id,
                Assignment.supervisor_id == teacher.id,
                Assignment.status != AssignmentStatus.CANCELLED,
            )
            .order_by(Assignment.assigned_at.desc(), Assignment.id.desc())
        )
    )
    if not rows:
        raise HTTPException(status_code=404, detail="Student not found")
    student = rows[0].student
    department = db.get(Department, student.department_id) if student.department_id else None
    return StudentDetail(
        **StudentSummary.model_validate(student).model_dump(exclude={"full_name"}),
        department_name=department.name if department else None,
        assignments=[AssignmentDetail.model_validate(row) for row in rows],
    )


def workload_query():
    """Count active assignments once and retain supervisors with zero load."""
    loads = (
        select(
            Assignment.supervisor_id,
            func.count(Assignment.id).label("current_load"),
        )
        .where(Assignment.status == AssignmentStatus.ACTIVE)
        .group_by(Assignment.supervisor_id)
        .subquery()
    )
    return (
        select(Teacher, func.coalesce(loads.c.current_load, 0))
        .outerjoin(loads, loads.c.supervisor_id == Teacher.id)
        .join(Teacher.user)
        .where(
            User.role.in_((UserRole.NAUCHRUK, UserRole.ZAVKAF)),
            User.is_active.is_(True),
        )
        .options(selectinload(Teacher.user), selectinload(Teacher.department))
    )


def workload_card(teacher: Teacher, load: int) -> SupervisorWorkload:
    """Build workload cards without exposing internal account fields."""
    user = teacher.user
    return SupervisorWorkload(
        supervisor_id=teacher.id,
        user_id=user.id,
        full_name=" ".join(
            part for part in (user.last_name, user.first_name, user.middle_name) if part
        ),
        email=user.email,
        department_id=teacher.department_id,
        department_name=teacher.department.name,
        current_load=load,
        max_students=teacher.max_students,
        available_places=max(0, teacher.max_students - load),
    )


def scoped_department(db: Session, actor: User, requested_id: int | None) -> Department:
    """Heads are fixed to their department; admins must explicitly select one."""
    if actor.role == UserRole.ADMIN:
        if requested_id is None:
            raise HTTPException(status_code=422, detail="department_id is required for admins")
        return require_department(db, requested_id)
    teacher = require_supervisor_profile(actor)
    target_id = teacher.department_id if requested_id is None else requested_id
    check_department_scope(actor, target_id)
    return require_department(db, target_id)


def department_workload(
    db: Session,
    actor: User,
    department_id: int | None,
    offset: int,
    limit: int,
) -> list[SupervisorWorkload]:
    """Return a bounded workload table in the head's authorized department."""
    department = scoped_department(db, actor, department_id)
    return [
        workload_card(teacher, load)
        for teacher, load in db.execute(
            workload_query()
            .where(Teacher.department_id == department.id)
            .order_by(Teacher.id)
            .offset(offset)
            .limit(limit)
        )
    ]


def supervisor_dashboard(db: Session, actor: User) -> SupervisorDashboard:
    """Aggregate the supervisor's own records after processing overdue requests."""
    refresh_expired_applications(db)
    teacher = require_supervisor_profile(actor)
    load = (
        db.scalar(
            select(func.count(Assignment.id)).where(
                Assignment.supervisor_id == teacher.id, Assignment.status == AssignmentStatus.ACTIVE
            )
        )
        or 0
    )
    topics = db.scalar(select(func.count(Topic.id)).where(Topic.supervisor_id == teacher.id)) or 0
    students = (
        db.scalar(
            select(func.count(func.distinct(Assignment.student_id))).where(
                Assignment.supervisor_id == teacher.id,
                Assignment.status != AssignmentStatus.CANCELLED,
            )
        )
        or 0
    )
    pending = (
        db.scalar(
            select(func.count(Application.id))
            .join(Application.topic)
            .where(
                Topic.supervisor_id == teacher.id, Application.status == ApplicationStatus.PENDING
            )
        )
        or 0
    )
    return SupervisorDashboard(
        **workload_card(teacher, load).model_dump(),
        topics_count=topics,
        students_count=students,
        pending_applications=pending,
        recent_applications=visible_applications(db, actor, None, 0, 5),
        recent_assignments=supervisor_assignments(db, actor, 0, 5),
    )


def head_dashboard(db: Session, actor: User, department_id: int | None) -> HeadDashboard:
    """Aggregate a single authorized department; counts are independent of pagination."""
    department = scoped_department(db, actor, department_id)
    refresh_expired_applications(db)
    workload = [
        workload_card(teacher, load)
        for teacher, load in db.execute(
            workload_query().where(Teacher.department_id == department.id)
        )
    ]
    students = (
        db.scalar(
            select(func.count(Student.id))
            .join(Student.user)
            .where(
                Student.department_id == department.id,
                User.role == UserRole.STUDENT,
                User.is_active.is_(True),
            )
        )
        or 0
    )
    topic_counts = dict(
        db.execute(
            select(Topic.status, func.count(Topic.id))
            .where(Topic.department_id == department.id)
            .group_by(Topic.status)
        ).all()
    )
    pending = (
        db.scalar(
            select(func.count(Application.id))
            .join(Application.topic)
            .where(
                Topic.department_id == department.id,
                Application.status == ApplicationStatus.PENDING,
            )
        )
        or 0
    )
    active = (
        db.scalar(
            select(func.count(Assignment.id))
            .join(Assignment.topic)
            .where(
                Topic.department_id == department.id, Assignment.status == AssignmentStatus.ACTIVE
            )
        )
        or 0
    )
    return HeadDashboard(
        department_id=department.id,
        department_name=department.name,
        students_count=students,
        supervisors_count=len(workload),
        active_assignments=active,
        pending_applications=pending,
        topics=TopicCounts(**topic_counts),
        current_load=sum(item.current_load for item in workload),
        max_students=sum(item.max_students for item in workload),
        available_places=sum(item.available_places for item in workload),
    )
