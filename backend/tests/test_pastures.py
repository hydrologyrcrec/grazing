from fastapi.testclient import TestClient

from tests.conftest import csrf_headers, signup

COORDINATES = [[27.4800, -81.9200], [27.4800, -81.9190], [27.4810, -81.9190], [27.4810, -81.9200]]


def payload(name="North pasture"):
    return {
        "name": name,
        "coordinates": COORDINATES,
        "grassType": "Bahiagrass",
        "landUse": "GRAZING",
        "color": "#28a8cf",
        "grazeableAreaAcres": 1.0,
    }


def test_create_list_get_update_archive(client):
    signup(client)
    headers = csrf_headers(client)
    created = client.post("/api/pastures", headers=headers, json=payload())
    assert created.status_code == 201, created.text
    pasture = created.json()["pasture"]
    assert 2.6 < pasture["areaAcres"] < 2.8
    assert pasture["coordinates"] == COORDINATES
    assert pasture["centroid"] == [27.4805, -81.9195]
    assert pasture["version"] == 1
    resource = f"/api/pastures/{pasture['id']}"
    assert client.get(resource).json()["pasture"]["name"] == "North pasture"
    assert len(client.get("/api/pastures").json()["pastures"]) == 1
    updated = client.patch(
        resource,
        headers=headers,
        json={"version": 1, "name": "Updated pasture", "description": "Notes"},
    )
    assert updated.status_code == 200, updated.text
    assert updated.json()["pasture"]["version"] == 2
    assert updated.json()["pasture"]["description"] == "Notes"
    conflict = client.patch(resource, headers=headers, json={"version": 1, "name": "Stale change"})
    assert conflict.status_code == 409
    assert conflict.json()["error"] == "PASTURE_VERSION_CONFLICT"
    assert client.delete(resource, headers=headers).status_code == 204
    assert client.get(resource).status_code == 404
    assert client.get("/api/pastures").json()["pastures"] == []


def test_cross_account_access_is_hidden(client, app):
    signup(client)
    pasture = client.post("/api/pastures", headers=csrf_headers(client), json=payload()).json()[
        "pasture"
    ]
    other = TestClient(app)
    signup(other, "other@example.org")
    resource = f"/api/pastures/{pasture['id']}"
    headers = csrf_headers(other)
    assert other.get(resource).status_code == 404
    assert (
        other.patch(resource, headers=headers, json={"version": 1, "name": "Stolen"}).status_code
        == 404
    )
    assert other.delete(resource, headers=headers).status_code == 404
    assert other.get("/api/pastures").json()["pastures"] == []


def test_boundary_and_area_validation(client):
    signup(client)
    headers = csrf_headers(client)
    for change in [
        {"coordinates": [[0, 0], [0, 0], [0, 0]]},
        {"coordinates": [[27.48, -81.92], [27.481, -81.919], [27.48, -81.919], [27.481, -81.92]]},
        {"coordinates": [[91, 0], [0, 0], [1, 1]]},
        {"coordinates": [[True, 0], [0, 1], [1, 1]]},
        {"coordinates": [[0, 0], [0, 1], [0, 2]]},
        {"grazeableAreaAcres": 50},
        {"grazeableAreaAcres": 0},
        {"color": "javascript:alert(1)"},
        {"unexpected": "field"},
    ]:
        assert (
            client.post("/api/pastures", headers=headers, json={**payload(), **change}).status_code
            == 400
        ), change


def test_duplicate_name_and_patch_validation(client):
    signup(client)
    headers = csrf_headers(client)
    created = client.post("/api/pastures", headers=headers, json=payload())
    assert client.post("/api/pastures", headers=headers, json=payload()).status_code == 409
    resource = f"/api/pastures/{created.json()['pasture']['id']}"
    for body in [{"version": 1}, {"version": 1, "name": None}, {"version": True, "name": "a"}]:
        assert client.patch(resource, headers=headers, json=body).status_code == 400
    assert (
        client.patch(
            resource, headers=headers, json={"version": 1, "description": None}
        ).status_code
        == 200
    )
    assert client.get("/api/pastures/not-a-uuid").status_code == 400
