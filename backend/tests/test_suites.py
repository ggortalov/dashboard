"""Tests for suite routes in app/routes/suites.py."""

from tests.conftest import create_project, create_suite


class TestListSuites:
    """Tests for GET /api/projects/:pid/suites."""

    def test_list_suites_empty(self, client, auth_headers):
        """Returns an empty list when no suites exist for the project."""
        project = create_project(client, auth_headers)
        resp = client.get(f"/api/projects/{project['id']}/suites", headers=auth_headers)
        assert resp.status_code == 200
        assert resp.get_json() == []

    def test_list_suites_with_data(self, client, auth_headers):
        """Returns suites created under a project."""
        project = create_project(client, auth_headers)
        create_suite(client, auth_headers, project["id"], name="Suite A")
        create_suite(client, auth_headers, project["id"], name="Suite B")

        resp = client.get(f"/api/projects/{project['id']}/suites", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert len(data) == 2
        names = [s["name"] for s in data]
        assert "Suite A" in names
        assert "Suite B" in names

    def test_list_suites_includes_counts(self, client, auth_headers):
        """Listed suites include section_count and case_count."""
        project = create_project(client, auth_headers)
        create_suite(client, auth_headers, project["id"])

        resp = client.get(f"/api/projects/{project['id']}/suites", headers=auth_headers)
        data = resp.get_json()
        assert "section_count" in data[0]
        assert "case_count" in data[0]


class TestCreateSuite:
    """Tests for POST /api/projects/:pid/suites."""

    def test_create_suite_success(self, client, auth_headers):
        """Creating a suite returns 201 with suite data."""
        project = create_project(client, auth_headers)
        resp = client.post(
            f"/api/projects/{project['id']}/suites",
            json={"name": "New Suite", "description": "Suite desc"},
            headers=auth_headers,
        )
        assert resp.status_code == 201
        data = resp.get_json()
        assert data["name"] == "New Suite"
        assert data["project_id"] == project["id"]

    def test_create_suite_missing_name(self, client, auth_headers):
        """Creating a suite without a name returns 400."""
        project = create_project(client, auth_headers)
        resp = client.post(
            f"/api/projects/{project['id']}/suites",
            json={"description": "No name"},
            headers=auth_headers,
        )
        assert resp.status_code == 400

    def test_create_suite_nonexistent_project(self, client, auth_headers):
        """Creating a suite for a non-existent project returns 404."""
        resp = client.post(
            "/api/projects/9999/suites",
            json={"name": "Orphan Suite"},
            headers=auth_headers,
        )
        assert resp.status_code == 404


class TestGetSuite:
    """Tests for GET /api/suites/:id."""

    def test_get_suite(self, client, auth_headers):
        """Returns suite details including case_count."""
        project = create_project(client, auth_headers)
        suite = create_suite(client, auth_headers, project["id"])

        resp = client.get(f"/api/suites/{suite['id']}", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["name"] == "Test Suite"
        assert "case_count" in data

    def test_get_suite_not_found(self, client, auth_headers):
        """Requesting a non-existent suite returns 404."""
        resp = client.get("/api/suites/9999", headers=auth_headers)
        assert resp.status_code == 404


class TestUpdateSuite:
    """Tests for PUT /api/suites/:id."""

    def test_update_suite(self, client, auth_headers):
        """Updating a suite changes its name and description."""
        project = create_project(client, auth_headers)
        suite = create_suite(client, auth_headers, project["id"])

        resp = client.put(
            f"/api/suites/{suite['id']}",
            json={"name": "Updated Suite", "description": "New desc"},
            headers=auth_headers,
        )
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["name"] == "Updated Suite"


class TestDeleteSuite:
    """Tests for DELETE /api/suites/:id."""

    def test_delete_suite(self, client, auth_headers):
        """Deleting a suite returns 200 and removes it."""
        project = create_project(client, auth_headers)
        suite = create_suite(client, auth_headers, project["id"])

        resp = client.delete(f"/api/suites/{suite['id']}", headers=auth_headers)
        assert resp.status_code == 200

        # Verify it is gone
        get_resp = client.get(f"/api/suites/{suite['id']}", headers=auth_headers)
        assert get_resp.status_code == 404

    def test_delete_suite_not_found(self, client, auth_headers):
        """Deleting a non-existent suite returns 404."""
        resp = client.delete("/api/suites/9999", headers=auth_headers)
        assert resp.status_code == 404
