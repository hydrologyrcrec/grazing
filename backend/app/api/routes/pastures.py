from uuid import UUID

from fastapi import APIRouter, Response

from app.api.dependencies import ActiveUser, Db
from app.schemas.pasture import PastureCreate, PastureEnvelope, PastureList, PastureUpdate
from app.services.pastures import PastureService

router = APIRouter(prefix="/pastures", tags=["Pastures"])


@router.get("", response_model=PastureList)
def list_pastures(user: ActiveUser, db: Db) -> PastureList:
    return PastureList(pastures=PastureService(db).list(user.id))


@router.post("", response_model=PastureEnvelope, status_code=201)
def create_pasture(payload: PastureCreate, user: ActiveUser, db: Db) -> PastureEnvelope:
    return PastureEnvelope(pasture=PastureService(db).create(user.id, payload))


@router.get("/{pasture_id}", response_model=PastureEnvelope)
def get_pasture(pasture_id: UUID, user: ActiveUser, db: Db) -> PastureEnvelope:
    return PastureEnvelope(pasture=PastureService(db).get(user.id, pasture_id))


@router.patch("/{pasture_id}", response_model=PastureEnvelope)
def update_pasture(
    pasture_id: UUID, payload: PastureUpdate, user: ActiveUser, db: Db
) -> PastureEnvelope:
    return PastureEnvelope(pasture=PastureService(db).update(user.id, pasture_id, payload))


@router.delete("/{pasture_id}", status_code=204)
def archive_pasture(pasture_id: UUID, user: ActiveUser, db: Db) -> Response:
    PastureService(db).archive(user.id, pasture_id)
    return Response(status_code=204)
