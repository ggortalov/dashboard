"""Tests for section routes in app/routes/sections.py."""

from tests.conftest import create_project, create_suite, create_section


class TestListSections:
    """Tests for GET /api/suites/:sid/sections."""

    def test_list_sections_empty(self, client, auth_headers):
        """Returns an empty list when no sections exist for the suite."""
        project = create_project(client, auth_headers)
        suite = create_suite(client, auth_headers, project["id"])

        resp = client.get(f"/api/suites/{suite['id']}/sections", headers=auth_headers)
        assert resp.status_code == 200
        assert resp.get_json() == []

    def test_list_sections_with_data(self, client, auth_headers):
        """Returns sections created under a suite."""
        project = create_project(client, auth_headers)
        suite = create_suite(client, auth_headers, project["id"])
        create_section(client, auth_headers, suite["id"], name="Section A")
        create_section(client, auth_headers, suite["id"], name="Section B")

        resp = client.get(f"/api/suites/{suite['id']}/sections", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert len(data) == 2
        names = [s["name"] for s in data]
        assert "Section A" in names
        assert "Section B" in names

    def test_list_sections_includes_case_count(self, client, auth_headers):
        """Listed sections include case_count."""
        project = create_project(client, auth_headers)
        suite = create_suite(client, auth_headers, project["id"])
        create_section(client, auth_headers, suite["id"])

        resp = client.get(f"/api/suites/{suite['id']}/sections", headers=auth_headers)
        data = resp.get_json()
        assert "case_count" in data[0]


class TestCreateSection:
    """Tests for POST /api/suites/:sid/sections."""

    def test_create_section_success(self, client, auth_headers):
        """Creating a section returns 201 with section data."""
        project = create_project(client, auth_headers)
        suite = create_suite(client, auth_headers, project["id"])

        resp = client.post(
            f"/api/suites/{suite['id']}/sections",
            json={"name": "New Section"},
            headers=auth_headers,
        )
        assert resp.status_code == 201
        data = resp.get_json()
        assert data["name"] == "New Section"
        assert data["suite_id"] == suite["id"]
        assert data["parent_id"] is None

    def test_create_section_with_parent(self, client, auth_headers):
        """Creating a child section sets parent_id correctly."""
        project = create_project(client, auth_headers)
        suite = create_suite(client, auth_headers, project["id"])
        parent = create_section(client, auth_headers, suite["id"], name="Parent")

        resp = client.post(
            f"/api/suites/{suite['id']}/sections",
            json={"name": "Child Section", "parent_id": parent["id"]},
            headers=auth_headers,
        )
        assert resp.status_code == 201
        data = resp.get_json()
        assert data["parent_id"] == parent["id"]
        assert data["name"] == "Child Section"

    def test_create_section_missing_name(self, client, auth_headers):
        """Creating a section without a name returns 400."""
        project = create_project(client, auth_headers)
        suite = create_suite(client, auth_headers, project["id"])

        resp = client.post(
            f"/api/suites/{suite['id']}/sections",
            json={"description": "No name"},
            headers=auth_headers,
        )
        assert resp.status_code == 400

    def test_create_section_nonexistent_suite(self, client, auth_headers):
        """Creating a section for a non-existent suite returns 404."""
        resp = client.post(
            "/api/suites/9999/sections",
            json={"name": "Orphan Section"},
            headers=auth_headers,
        )
        assert resp.status_code == 404


class TestUpdateSection:
    """Tests for PUT /api/sections/:id."""

    def test_update_section(self, client, auth_headers):
        """Updating a section changes its fields."""
        project = create_project(client, auth_headers)
        suite = create_suite(client, auth_headers, project["id"])
        section = create_section(client, auth_headers, suite["id"])

        resp = client.put(
            f"/api/sections/{section['id']}",
            json={"name": "Updated Section", "display_order": 5},
            headers=auth_headers,
        )
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["name"] == "Updated Section"
        assert data["display_order"] == 5

    def test_update_section_not_found(self, client, auth_headers):
        """Updating a non-existent section returns 404."""
        resp = client.put(
            "/api/sections/9999",
            json={"name": "Ghost"},
            headers=auth_headers,
        )
        assert resp.status_code == 404


class TestDeleteSection:
    """Tests for DELETE /api/sections/:id."""

    def test_delete_section(self, client, auth_headers):
        """Deleting a section returns 200 and removes it."""
        project = create_project(client, auth_headers)
        suite = create_suite(client, auth_headers, project["id"])
        section = create_section(client, auth_headers, suite["id"])

        resp = client.delete(f"/api/sections/{section['id']}", headers=auth_headers)
        assert resp.status_code == 200

        # Verify it is gone
        sections_resp = client.get(f"/api/suites/{suite['id']}/sections", headers=auth_headers)
        assert len(sections_resp.get_json()) == 0

    def test_delete_section_cascades_to_children(self, client, auth_headers):
        """Deleting a parent section cascades to its children."""
        project = create_project(client, auth_headers)
        suite = create_suite(client, auth_headers, project["id"])
        parent = create_section(client, auth_headers, suite["id"], name="Parent")
        create_section(client, auth_headers, suite["id"], name="Child", parent_id=parent["id"])

        # Verify both exist
        sections_resp = client.get(f"/api/suites/{suite['id']}/sections", headers=auth_headers)
        assert len(sections_resp.get_json()) == 2

        # Delete parent
        resp = client.delete(f"/api/sections/{parent['id']}", headers=auth_headers)
        assert resp.status_code == 200

        # Verify both are gone
        sections_resp = client.get(f"/api/suites/{suite['id']}/sections", headers=auth_headers)
        assert len(sections_resp.get_json()) == 0

    def test_delete_section_not_found(self, client, auth_headers):
        """Deleting a non-existent section returns 404."""
        resp = client.delete("/api/sections/9999", headers=auth_headers)
        assert resp.status_code == 404
