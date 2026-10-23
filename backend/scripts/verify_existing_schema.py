"""Read-only preflight before stamping an existing Prisma database."""

from sqlalchemy import Enum, inspect
from sqlalchemy.dialects.postgresql import JSONB

from app.core.config import get_settings
from app.db.session import Database
from app.models import AuthSession, Pasture, User


def main() -> None:
    database = Database(get_settings())
    inspector = inspect(database.engine)
    failures: list[str] = []
    tables = set(inspector.get_table_names())
    for model in (User, AuthSession, Pasture):
        table = model.__table__
        if table.name not in tables:
            failures.append(f"Missing table: {table.name}")
            continue
        actual = {item["name"]: item for item in inspector.get_columns(table.name)}
        for column in table.columns:
            observed = actual.get(column.name)
            if observed is None:
                failures.append(f"Missing column: {table.name}.{column.name}")
                continue
            expected_type = column.type.dialect_impl(database.engine.dialect)
            actual_type = observed["type"]
            if isinstance(expected_type, Enum):
                matches = (
                    getattr(actual_type, "name", None) == expected_type.name
                    and getattr(actual_type, "enums", None) == expected_type.enums
                )
            elif isinstance(expected_type, JSONB):
                matches = isinstance(actual_type, JSONB)
            else:
                matches = expected_type._type_affinity is actual_type._type_affinity
                for attribute in ("length", "precision", "scale", "timezone"):
                    expected = getattr(expected_type, attribute, None)
                    if expected is not None and getattr(actual_type, attribute, None) != expected:
                        matches = False
            if not matches or observed["nullable"] != column.nullable:
                failures.append(f"Type/nullability mismatch: {table.name}.{column.name}")
        if inspector.get_pk_constraint(table.name)["constrained_columns"] != ["id"]:
            failures.append(f"Unexpected primary key: {table.name}")
        observed_indexes = {
            tuple(item["column_names"]): item.get("unique", False)
            for item in inspector.get_indexes(table.name)
        }
        observed_indexes.update(
            {
                tuple(item["column_names"]): True
                for item in inspector.get_unique_constraints(table.name)
            }
        )
        for index in table.indexes:
            key = tuple(column.name for column in index.columns)
            if key not in observed_indexes or bool(observed_indexes[key]) != bool(index.unique):
                failures.append(f"Missing/mismatched index: {table.name}.{index.name}")
        for column in table.columns:
            if column.unique and observed_indexes.get((column.name,)) is not True:
                failures.append(f"Missing uniqueness: {table.name}.{column.name}")
        for constraint in table.foreign_key_constraints:
            key = [element.parent.name for element in constraint.elements]
            candidates = [
                item
                for item in inspector.get_foreign_keys(table.name)
                if item["constrained_columns"] == key
            ]
            if not candidates or candidates[0]["referred_table"] != "User":
                failures.append(f"Missing foreign key: {table.name}.{key}")
            elif candidates[0].get("options", {}).get("ondelete") != constraint.ondelete:
                failures.append(f"Foreign key delete rule mismatch: {table.name}.{key}")
    database.engine.dispose()
    if failures:
        raise SystemExit("Schema verification failed:\n" + "\n".join(failures))
    print(
        "Schema verified. Review the backup and cutover plan before "
        "alembic stamp 0001_prisma_baseline."
    )


if __name__ == "__main__":
    main()
