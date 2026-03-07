"""Tests for project routes in app/routes/projects.py."""

from tests.conftest import create_project


class TestListProjects:
    """Tests for GET /api/projects."""

    def test_list_projects_empty(self, client, auth_headers):
        """Returns an empty list when no projects exist."""
        resp = client.get("/api/projects", headers=auth_headers)
        assert resp.status_code == 200
        assert resp.get_json() == []

    def test_list_projects_with_data(self, client, auth_headers):
        """Returns a list of projects after creation."""
        create_project(client, auth_headers, name="Project A")
        create_project(client, auth_headers, name="Project B")

        resp = client.get("/api/projects", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert len(data) == 2
        names = [p["name"] for p in data]
        assert "Project A" in names
        assert "Project B" in names


class TestCreateProject:
    """Tests for POST /api/projects."""

    def test_create_project_success(self, client, auth_headers):
        """Creating a project returns 201 with project data."""
        resp = client.post(
            "/api/projects",
            json={"name": "New Project", "description": "A description"},
            headers=auth_headers,
        )
        assert resp.status_code == 201
        data = resp.get_json()
        assert data["name"] == "New Project"
        assert data["description"] == "A description"
        assert "id" in data
        assert "created_at" in data

    def test_create_project_missing_name(self, client, auth_headers):
        """Creating a project without a name returns 400."""
        resp = client.post(
            "/api/projects",
            json={"description": "No name"},
            headers=auth_headers,
        )
        assert resp.status_code == 400

    def test_create_project_empty_name(self, client, auth_headers):
        """Creating a project with an empty name returns 400."""
        resp = client.post(
            "/api/projects",
            json={"name": "   ", "description": "Whitespace name"},
            headers=auth_headers,
        )
        assert resp.status_code == 400

    def test_create_project_no_auth(self, client):
        """Creating a project without auth returns 401."""
        resp = client.post(
            "/api/projects",
            json={"name": "Unauthorized"},
        )
        assert resp.status_code == 401


class TestGetProject:
    """Tests for GET /api/projects/:id."""

    def test_get_project(self, client, auth_headers):
        """Returns project with suite/case/run counts."""
        project = create_project(client, auth_headers)
        resp = client.get(f"/api/projects/{project['id']}", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["name"] == "Test Project"
        assert "suite_count" in data
        assert "case_count" in data
        assert "run_count" in data

    def test_get_project_not_found(self, client, auth_headers):
        """Requesting a non-existent project returns 404."""
        resp = client.get("/api/projects/9999", headers=auth_headers)
        assert resp.status_code == 404


class TestUpdateProject:
    """Tests for PUT /api/projects/:id."""

    def test_update_project(self, client, auth_headers):
        """Updating a project changes its name and description."""
        project = create_project(client, auth_headers)
        resp = client.put(
            f"/api/projects/{project['id']}",
            json={"name": "Updated Name", "description": "Updated desc"},
            headers=auth_headers,
        )
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["name"] == "Updated Name"
        assert data["description"] == "Updated desc"

    def test_update_project_partial(self, client, auth_headers):
        """Partial update only changes specified fields."""
        project = create_project(client, auth_headers, name="Original", description="Orig desc")
        resp = client.put(
            f"/api/projects/{project['id']}",
            json={"name": "New Name"},
            headers=auth_headers,
        )
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["name"] == "New Name"
        assert data["description"] == "Orig desc"


class TestDeleteProject:
    """Tests for DELETE /api/projects/:id."""

    def test_delete_project(self, client, auth_headers):
        """Deleting a project returns 200 and removes it."""
        project = create_project(client, auth_headers)
        resp = client.delete(f"/api/projects/{project['id']}", headers=auth_headers)
        assert resp.status_code == 200

        # Verify it is gone
        get_resp = client.get(f"/api/projects/{project['id']}", headers=auth_headers)
        assert get_resp.status_code == 404

    def test_delete_project_not_found(self, client, auth_headers):
        """Deleting a non-existent project returns 404."""
        resp = client.delete("/api/projects/9999", headers=auth_headers)
        assert resp.status_code == 404


class TestProjectStats:
    """Tests for GET /api/projects/:id/stats."""

    def test_project_stats_empty(self, client, auth_headers):
        """Stats for a project with no runs returns all zeros."""
        project = create_project(client, auth_headers)
        resp = client.get(f"/api/projects/{project['id']}/stats", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["Passed"] == 0
        assert data["Failed"] == 0
        assert data["Blocked"] == 0
        assert data["Retest"] == 0
        assert data["Untested"] == 0

    def test_project_stats_not_found(self, client, auth_headers):
        """Stats for a non-existent project returns 404."""
        resp = client.get("/api/projects/9999/stats", headers=auth_headers)
        assert resp.status_code == 404
