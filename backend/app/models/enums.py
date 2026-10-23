from enum import StrEnum


class UserStatus(StrEnum):
    ACTIVE = "ACTIVE"
    SUSPENDED = "SUSPENDED"
    DISABLED = "DISABLED"


class PastureStatus(StrEnum):
    ACTIVE = "ACTIVE"
    ARCHIVED = "ARCHIVED"


class LandUse(StrEnum):
    GRAZING = "GRAZING"
    HAY = "HAY"
    MIXED = "MIXED"
    OTHER = "OTHER"
