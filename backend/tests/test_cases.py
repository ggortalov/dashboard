"""Tests for test case routes in app/routes/test_cases.py."""

from tests.conftest import (
    create_project,
    create_suite,
    create_section,
    create_test_case,
)


class TestCreateCase:
    """Tests for POST /api/cases."""

    def test_create_case_success(self, client, auth_headers):
        """Creating a test case returns 201 with full case data."""
        project = create_project(client, auth_headers)
        suite = create_suite(client, auth_headers, project["id"])
        section = create_section(client, auth_headers, suite["id"])

        resp = client.post(
            "/api/cases",
            json={
                "title": "Login Test",
                "suite_id": suite["id"],
                "section_id": section["id"],
                "case_type": "Functional",
                "priority": "High",
                "preconditions": "User exists",
                "steps": [
                    {"action": "Enter credentials", "expected": "Fields filled"},
                    {"action": "Click login", "expected": "User logged in"},
                ],
                "expected_result": "User sees dashboard",
            },
            headers=auth_headers,
        )
        assert resp.status_code == 201
        data = resp.get_json()
        assert data["title"] == "Login Test"
        assert data["case_type"] == "Functional"
        assert data["priority"] == "High"
        assert len(data["steps"]) == 2
        assert data["steps"][0]["action"] == "Enter credentials"
        assert data["expected_result"] == "User sees dashboard"

    def test_create_case_missing_title(self, client, auth_headers):
        """Creating a case without title returns 400."""
        project = create_project(client, auth_headers)
        suite = create_suite(client, auth_headers, project["id"])
        section = create_section(client, auth_headers, suite["id"])

        resp = client.post(
            "/api/cases",
            json={
                "suite_id": suite["id"],
                "section_id": section["id"],
            },
            headers=auth_headers,
        )
        assert resp.status_code == 400

    def test_create_case_missing_suite_id(self, client, auth_headers):
        """Creating a case without suite_id returns 400."""
        project = create_project(client, auth_headers)
        suite = create_suite(client, auth_headers, project["id"])
        section = create_section(client, auth_headers, suite["id"])

        resp = client.post(
            "/api/cases",
            json={
                "title": "No Suite",
                "section_id": section["id"],
            },
            headers=auth_headers,
        )
        assert resp.status_code == 400

    def test_create_case_duplicate_title(self, client, auth_headers):
        """Creating a case with a duplicate title returns 409."""
        project = create_project(client, auth_headers)
        suite = create_suite(client, auth_headers, project["id"])
        section = create_section(client, auth_headers, suite["id"])

        create_test_case(client, auth_headers, suite["id"], section["id"], title="Unique Title")

        resp = client.post(
            "/api/cases",
            json={
                "title": "Unique Title",
                "suite_id": suite["id"],
                "section_id": section["id"],
            },
            headers=auth_headers,
        )
        assert resp.status_code == 409
        assert "already exists" in resp.get_json()["error"]


class TestGetCase:
    """Tests for GET /api/cases/:id."""

    def test_get_case(self, client, auth_headers):
        """Returns full case details."""
        project = create_project(client, auth_headers)
        suite = create_suite(client, auth_headers, project["id"])
        section = create_section(client, auth_headers, suite["id"])
        case = create_test_case(client, auth_headers, suite["id"], section["id"])

        resp = client.get(f"/api/cases/{case['id']}", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["title"] == "Test Case 1"
        assert "section_name" in data
        assert "project_id" in data
        assert "suite_name" in data
        assert "author_name" in data
        assert isinstance(data["steps"], list)

    def test_get_case_not_found(self, client, auth_headers):
        """Requesting a non-existent case returns 404."""
        resp = client.get("/api/cases/9999", headers=auth_headers)
        assert resp.status_code == 404


class TestUpdateCase:
    """Tests for PUT /api/cases/:id."""

    def test_update_case(self, client, auth_headers):
        """Updating a case changes its fields."""
        project = create_project(client, auth_headers)
        suite = create_suite(client, auth_headers, project["id"])
        section = create_section(client, auth_headers, suite["id"])
        case = create_test_case(client, auth_headers, suite["id"], section["id"])

        resp = client.put(
            f"/api/cases/{case['id']}",
            json={
                "title": "Updated Title",
                "priority": "Critical",
                "steps": [{"action": "New step", "expected": "New result"}],
            },
            headers=auth_headers,
        )
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["title"] == "Updated Title"
        assert data["priority"] == "Critical"
        assert len(data["steps"]) == 1

    def test_update_case_duplicate_title(self, client, auth_headers):
        """Updating a case to a title that already exists returns 409."""
        project = create_project(client, auth_headers)
        suite = create_suite(client, auth_headers, project["id"])
        section = create_section(client, auth_headers, suite["id"])

        create_test_case(client, auth_headers, suite["id"], section["id"], title="Existing Case")
        case2 = create_test_case(client, auth_headers, suite["id"], section["id"], title="Another Case")

        resp = client.put(
            f"/api/cases/{case2['id']}",
            json={"title": "Existing Case"},
            headers=auth_headers,
        )
        assert resp.status_code == 409

    def test_update_case_not_found(self, client, auth_headers):
        """Updating a non-existent case returns 404."""
        resp = client.put(
            "/api/cases/9999",
            json={"title": "Ghost"},
            headers=auth_headers,
        )
        assert resp.status_code == 404


class TestDeleteCase:
    """Tests for DELETE /api/cases/:id."""

    def test_delete_case(self, client, auth_headers):
        """Deleting a case returns 200 and removes it."""
        project = create_project(client, auth_headers)
        suite = create_suite(client, auth_headers, project["id"])
        section = create_section(client, auth_headers, suite["id"])
        case = create_test_case(client, auth_headers, suite["id"], section["id"])

        resp = client.delete(f"/api/cases/{case['id']}", headers=auth_headers)
        assert resp.status_code == 200

        get_resp = client.get(f"/api/cases/{case['id']}", headers=auth_headers)
        assert get_resp.status_code == 404

    def test_delete_case_not_found(self, client, auth_headers):
        """Deleting a non-existent case returns 404."""
        resp = client.delete("/api/cases/9999", headers=auth_headers)
        assert resp.status_code == 404


class TestListCasesBySuite:
    """Tests for GET /api/suites/:sid/cases."""

    def test_list_cases_by_suite(self, client, auth_headers):
        """Returns all cases across sections in a suite."""
        project = create_project(client, auth_headers)
        suite = create_suite(client, auth_headers, project["id"])
        section = create_section(client, auth_headers, suite["id"])
        create_test_case(client, auth_headers, suite["id"], section["id"], title="Case A")
        create_test_case(client, auth_headers, suite["id"], section["id"], title="Case B")

        resp = client.get(f"/api/suites/{suite['id']}/cases", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert len(data) == 2
        assert "section_name" in data[0]
        assert "author_name" in data[0]

    def test_list_cases_by_suite_empty(self, client, auth_headers):
        """Returns empty list when suite has no cases."""
        project = create_project(client, auth_headers)
        suite = create_suite(client, auth_headers, project["id"])

        resp = client.get(f"/api/suites/{suite['id']}/cases", headers=auth_headers)
        assert resp.status_code == 200
        assert resp.get_json() == []


class TestBulkDeleteCases:
    """Tests for POST /api/cases/bulk-delete."""

    def test_bulk_delete_cases(self, client, auth_headers):
        """Bulk deleting cases removes multiple cases at once."""
        project = create_project(client, auth_headers)
        suite = create_suite(client, auth_headers, project["id"])
        section = create_section(client, auth_headers, suite["id"])
        case1 = create_test_case(client, auth_headers, suite["id"], section["id"], title="Bulk 1")
        case2 = create_test_case(client, auth_headers, suite["id"], section["id"], title="Bulk 2")

        resp = client.post(
            "/api/cases/bulk-delete",
            json={"ids": [case1["id"], case2["id"]]},
            headers=auth_headers,
        )
        assert resp.status_code == 200
        assert "2" in resp.get_json()["message"]

        # Verify both are gone
        assert client.get(f"/api/cases/{case1['id']}", headers=auth_headers).status_code == 404
        assert client.get(f"/api/cases/{case2['id']}", headers=auth_headers).status_code == 404

    def test_bulk_delete_no_ids(self, client, auth_headers):
        """Bulk delete with no IDs returns 400."""
        resp = client.post(
            "/api/cases/bulk-delete",
            json={"ids": []},
            headers=auth_headers,
        )
        assert resp.status_code == 400
