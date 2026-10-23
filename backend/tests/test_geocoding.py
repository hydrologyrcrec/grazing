import httpx

from tests.conftest import signup


def test_geocoding_cache_validation_and_response(client, app):
    signup(client)
    calls = []

    def handler(request):
        calls.append(request)
        return httpx.Response(
            200,
            json=[
                {
                    "lat": "27.48",
                    "lon": "-81.92",
                    "display_name": "Ona, Florida",
                    "boundingbox": ["27.4", "27.5", "-82.0", "-81.8"],
                }
            ],
        )

    app.state.geocoding.client.close()
    app.state.geocoding.client = httpx.Client(transport=httpx.MockTransport(handler))
    for _ in range(2):
        response = client.get("/api/geocode?q=Ona")
        assert response.status_code == 200
        assert response.json()[0]["boundingBox"] == [27.4, 27.5, -82.0, -81.8]
        assert response.json()[0]["lng"] == -81.92
    assert len(calls) == 1
    assert "GrazingApiTests" in calls[0].headers["user-agent"]
    assert client.get("/api/geocode?q=ab").status_code == 400
    assert client.get("/api/geocode?q=abc;def").status_code == 400


def test_upstream_error_is_normalized(client, app):
    signup(client)
    app.state.geocoding.client.close()
    app.state.geocoding.client = httpx.Client(
        transport=httpx.MockTransport(lambda request: httpx.Response(503))
    )
    response = client.get("/api/geocode?q=Ona")
    assert response.status_code == 502
    assert response.json()["error"] == "GEOCODER_UNAVAILABLE"
