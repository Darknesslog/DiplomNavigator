"""Workflow lock order: User -> Student -> Teacher -> Period -> Topic -> children.

Immutable participant IDs may be discovered before locking. Decisions must use
the refreshed rows afterwards. All rows at one level are acquired in ID order.
User locks also cover authors/recipients before later FK checks can acquire them.
"""

from collections.abc import Iterable

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.models import Application, ApplicationStatus, Student, Teacher, Topic, User


def lock_participants(
    db: Session,
    actor: User | None = None,
    *,
    student_ids: Iterable[int] = (),
    teacher_ids: Iterable[int] = (),
    user_ids: Iterable[int] = (),
    exclusive_user_ids: Iterable[int] = (),
) -> None:
    """Lock identities, then domain profiles, including the actor's scope profile.

    Profile ownership and workflow foreign keys are immutable in these commands.
    No profile may be created/rebound by role or department updates.
    """
    students, teachers = set(student_ids), set(teacher_ids)
    users, exclusive = set(user_ids), set(exclusive_user_ids)
    actor_role = actor.role if actor is not None else None
    if actor is not None:
        users.add(actor.id)
        if actor.student is not None:
            students.add(actor.student.id)
        if actor.teacher is not None:
            teachers.add(actor.teacher.id)
    users.update(exclusive)
    users.update(db.scalars(select(Student.user_id).where(Student.id.in_(students))))
    users.update(db.scalars(select(Teacher.user_id).where(Teacher.id.in_(teachers))))
    # Choose the strongest mode up front; never upgrade a shared identity lock.
    for user_id in sorted(users):
        db.scalar(
            select(User)
            .where(User.id == user_id)
            .with_for_update(read=user_id not in exclusive)
            .execution_options(populate_existing=True)
        )
    if actor is not None and (not actor.is_active or actor.role != actor_role):
        raise HTTPException(status_code=403, detail="Account permissions changed; retry request")
    for model, ids in ((Student, students), (Teacher, teachers)):
        list(
            db.scalars(
                select(model)
                .where(model.id.in_(ids))
                .order_by(model.id)
                .with_for_update()
                .execution_options(populate_existing=True)
            )
        )


def lock_topic(db: Session, topic_id: int) -> Topic:
    """Take the common barrier for creating links and closing a topic."""
    topic = db.scalar(
        select(Topic)
        .where(Topic.id == topic_id)
        .with_for_update()
        .execution_options(populate_existing=True)
    )
    if topic is None:
        raise HTTPException(status_code=404, detail="Topic not found")
    return topic


def lock_student_applications(
    db: Session, student_id: int, *, application_id: int | None = None
) -> list[Application]:
    """Lock the target and other pending applications as a single ordered group."""
    return list(
        db.scalars(
            select(Application)
            .where(
                Application.student_id == student_id,
                (Application.status == ApplicationStatus.PENDING)
                | (Application.id == application_id),
            )
            .order_by(Application.id)
            .with_for_update()
            .execution_options(populate_existing=True)
        )
    )
