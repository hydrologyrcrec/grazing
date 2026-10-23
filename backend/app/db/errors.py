from sqlalchemy.exc import IntegrityError


def is_unique_violation(error: IntegrityError) -> bool:
    """Recognize only uniqueness conflicts, not foreign-key or other integrity failures."""
    code = getattr(error.orig, "sqlstate", None)
    if code is not None:
        return code == "23505"
    return getattr(error.orig, "sqlite_errorcode", None) in {1555, 2067}
