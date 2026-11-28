"""Run the same lifecycle contract against the complete Alembic PostgreSQL schema."""

from backend.tests.test_department_topic_guards import (  # noqa: F401
    test_active_assignment_blocks_closure_without_partial_request,
    test_all_reasons_have_stable_priority_and_same_department_is_noop,
    test_first_department_assignment_is_audited,
    test_pending_blocks_deletion_approval,
    test_pending_blocks_department_transfer,
    test_pending_blocks_topic_moderation,
    test_same_department_still_requires_authorization,
    test_transfer_checks_pending_and_active_independently,
    test_transfer_checks_retained_profile_topics,
    test_transfer_preserves_historical_objects_and_records_one_audit,
    test_transfer_rolls_back_profile_and_audit_together,
    test_unoccupied_topic_can_be_closed,
)
