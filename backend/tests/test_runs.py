"""Tests for test run routes in app/routes/test_runs.py."""

from tests.conftest import (
    create_project,
    create_suite,
    create_section,
    create_test_case,
    create_test_run,
)


class TestCreateRun:
    """Tests for POST /api/projects/:pid/runs."""

    def test_create_run_auto_creates_results(self, client, auth_headers):
        """Creating a run auto-creates one Untested result per case in the suite."""
        project = create_project(client, auth_headers)
        suite = create_suite(client, auth_headers, project["id"])
        section = create_section(client, auth_headers, suite["id"])
        create_test_case(client, auth_headers, suite["id"], section["id"], title="Case 1")
        create_test_case(client, auth_headers, suite["id"], section["id"], title="Case 2")

        resp = client.post(
            f"/api/projects/{project['id']}/runs",
            json={"name": "Run 1", "suite_id": suite["id"]},
            headers=auth_headers,
        )
        assert resp.status_code == 201
        data = resp.get_json()
        assert data["name"] == "Run 1"
        assert data["suite_id"] == suite["id"]
        assert data["stats"]["Untested"] == 2
        assert data["stats"]["total"] == 2

    def test_create_run_missing_name(self, client, auth_headers):
        """Creating a run without a name returns 400."""
        project = create_project(client, auth_headers)
        suite = create_suite(client, auth_headers, project["id"])

        resp = client.post(
            f"/api/projects/{project['id']}/runs",
            json={"suite_id": suite["id"]},
            headers=auth_headers,
        )
        assert resp.status_code == 400

    def test_create_run_missing_suite(self, client, auth_headers):
        """Creating a run without suite_id returns 400."""
        project = create_project(client, auth_headers)

        resp = client.post(
            f"/api/projects/{project['id']}/runs",
            json={"name": "Run without suite"},
            headers=auth_headers,
        )
        assert resp.status_code == 400

    def test_create_run_empty_suite(self, client, auth_headers):
        """Creating a run for a suite with no cases creates a run with 0 results."""
        project = create_project(client, auth_headers)
        suite = create_suite(client, auth_headers, project["id"])

        resp = client.post(
            f"/api/projects/{project['id']}/runs",
            json={"name": "Empty Run", "suite_id": suite["id"]},
            headers=auth_headers,
        )
        assert resp.status_code == 201
        data = resp.get_json()
        assert data["stats"]["total"] == 0


class TestGetRun:
    """Tests for GET /api/runs/:id."""

    def test_get_run_with_stats(self, client, auth_headers):
        """Returns run details with aggregated status counts."""
        project = create_project(client, auth_headers)
        suite = create_suite(client, auth_headers, project["id"])
        section = create_section(client, auth_headers, suite["id"])
        create_test_case(client, auth_headers, suite["id"], section["id"], title="Case 1")
        run = create_test_run(client, auth_headers, project["id"], suite["id"])

        resp = client.get(f"/api/runs/{run['id']}", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["name"] == "Test Run 1"
        assert "stats" in data
        assert data["stats"]["Untested"] == 1
        assert data["stats"]["total"] == 1
        assert "suite_name" in data
        assert "project_name" in data

    def test_get_run_not_found(self, client, auth_headers):
        """Requesting a non-existent run returns 404."""
        resp = client.get("/api/runs/9999", headers=auth_headers)
        assert resp.status_code == 404


class TestListResults:
    """Tests for GET /api/runs/:id/results."""

    def test_list_results(self, client, auth_headers):
        """Returns all results for a run with case details."""
        project = create_project(client, auth_headers)
        suite = create_suite(client, auth_headers, project["id"])
        section = create_section(client, auth_headers, suite["id"])
        create_test_case(client, auth_headers, suite["id"], section["id"], title="Case A")
        create_test_case(client, auth_headers, suite["id"], section["id"], title="Case B")
        run = create_test_run(client, auth_headers, project["id"], suite["id"])

        resp = client.get(f"/api/runs/{run['id']}/results", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert len(data) == 2
        # Each result should have case info
        for result in data:
            assert "case_title" in result
            assert "status" in result
            assert result["status"] == "Untested"

    def test_list_results_run_not_found(self, client, auth_headers):
        """Listing results for a non-existent run returns 404."""
        resp = client.get("/api/runs/9999/results", headers=auth_headers)
        assert resp.status_code == 404


class TestUpdateResult:
    """Tests for PUT /api/results/:id."""

    def test_update_result_status(self, client, auth_headers):
        """Updating a result changes its status and records history."""
        project = create_project(client, auth_headers)
        suite = create_suite(client, auth_headers, project["id"])
        section = create_section(client, auth_headers, suite["id"])
        create_test_case(client, auth_headers, suite["id"], section["id"], title="Pass Case")
        run = create_test_run(client, auth_headers, project["id"], suite["id"])

        # Get the result ID
        results_resp = client.get(f"/api/runs/{run['id']}/results", headers=auth_headers)
        result_id = results_resp.get_json()[0]["id"]

        # Update to Passed
        resp = client.put(
            f"/api/results/{result_id}",
            json={
                "status": "Passed",
                "comment": "All good",
                "defect_id": "",
            },
            headers=auth_headers,
        )
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["status"] == "Passed"
        assert data["comment"] == "All good"
        assert data["tested_by"] is not None
        assert data["tested_at"] is not None

    def test_update_result_not_found(self, client, auth_headers):
        """Updating a non-existent result returns 404."""
        resp = client.put(
            "/api/results/9999",
            json={"status": "Passed"},
            headers=auth_headers,
        )
        assert resp.status_code == 404


class TestResultHistory:
    """Tests for GET /api/results/:id/history."""

    def test_result_history(self, client, auth_headers):
        """Updating a result creates a history entry."""
        project = create_project(client, auth_headers)
        suite = create_suite(client, auth_headers, project["id"])
        section = create_section(client, auth_headers, suite["id"])
        create_test_case(client, auth_headers, suite["id"], section["id"], title="History Case")
        run = create_test_run(client, auth_headers, project["id"], suite["id"])

        # Get the result ID
        results_resp = client.get(f"/api/runs/{run['id']}/results", headers=auth_headers)
        result_id = results_resp.get_json()[0]["id"]

        # Update result twice
        client.put(
            f"/api/results/{result_id}",
            json={"status": "Failed", "comment": "Bug found"},
            headers=auth_headers,
        )
        client.put(
            f"/api/results/{result_id}",
            json={"status": "Passed", "comment": "Bug fixed"},
            headers=auth_headers,
        )

        # Check history
        resp = client.get(f"/api/results/{result_id}/history", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert len(data) == 2
        # History is ordered by changed_at desc, so newest first
        assert data[0]["status"] == "Passed"
        assert data[1]["status"] == "Failed"

    def test_result_history_empty(self, client, auth_headers):
        """History is empty when no updates have been made."""
        project = create_project(client, auth_headers)
        suite = create_suite(client, auth_headers, project["id"])
        section = create_section(client, auth_headers, suite["id"])
        create_test_case(client, auth_headers, suite["id"], section["id"], title="Fresh Case")
        run = create_test_run(client, auth_headers, project["id"], suite["id"])

        results_resp = client.get(f"/api/runs/{run['id']}/results", headers=auth_headers)
        result_id = results_resp.get_json()[0]["id"]

        resp = client.get(f"/api/results/{result_id}/history", headers=auth_headers)
        assert resp.status_code == 200
        assert resp.get_json() == []

    def test_result_history_not_found(self, client, auth_headers):
        """History for a non-existent result returns 404."""
        resp = client.get("/api/results/9999/history", headers=auth_headers)
        assert resp.status_code == 404


class TestDeleteRun:
    """Tests for DELETE /api/runs/:id."""

    def test_delete_run(self, client, auth_headers):
        """Deleting a run returns 200 and removes it."""
        project = create_project(client, auth_headers)
        suite = create_suite(client, auth_headers, project["id"])
        section = create_section(client, auth_headers, suite["id"])
        create_test_case(client, auth_headers, suite["id"], section["id"], title="Del Case")
        run = create_test_run(client, auth_headers, project["id"], suite["id"])

        resp = client.delete(f"/api/runs/{run['id']}", headers=auth_headers)
        assert resp.status_code == 200

        get_resp = client.get(f"/api/runs/{run['id']}", headers=auth_headers)
        assert get_resp.status_code == 404

    def test_delete_run_not_found(self, client, auth_headers):
        """Deleting a non-existent run returns 404."""
        resp = client.delete("/api/runs/9999", headers=auth_headers)
        assert resp.status_code == 404


class TestListRuns:
    """Tests for GET /api/projects/:pid/runs."""

    def test_list_runs(self, client, auth_headers):
        """Returns runs for a project with stats."""
        project = create_project(client, auth_headers)
        suite = create_suite(client, auth_headers, project["id"])
        section = create_section(client, auth_headers, suite["id"])
        create_test_case(client, auth_headers, suite["id"], section["id"], title="List Case")
        create_test_run(client, auth_headers, project["id"], suite["id"], name="Run A")
        create_test_run(client, auth_headers, project["id"], suite["id"], name="Run B")

        resp = client.get(f"/api/projects/{project['id']}/runs", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert len(data) == 2
        for run in data:
            assert "stats" in run
            assert "suite_name" in run

    def test_list_runs_empty(self, client, auth_headers):
        """Returns empty list when project has no runs."""
        project = create_project(client, auth_headers)

        resp = client.get(f"/api/projects/{project['id']}/runs", headers=auth_headers)
        assert resp.status_code == 200
        assert resp.get_json() == []
