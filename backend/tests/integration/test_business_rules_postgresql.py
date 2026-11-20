"""Run the agreed policy cases against the complete migrated PostgreSQL schema."""

from backend.tests.test_business_rules import (  # noqa: F401
    test_admission_cannot_regress_via_progress_aliases,
    test_closed_period_blocks_both_application_paths,
    test_defended_work_is_terminal_for_progress_and_revocation,
    test_failed_approval_rolls_back_withdrawals_and_progress_history,
    test_manager_can_assign_in_closed_period_and_release_other_reservations,
    test_manager_revocation_records_actor_comment_and_allows_further_review,
    test_progress_history_is_scoped_and_persisted,
    test_revocation_rejects_student_supervisor_and_other_department,
    test_revocation_requires_nonblank_comment,
    test_withdrawn_reservation_does_not_archive_topic_at_timeout,
)
