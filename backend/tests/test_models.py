"""Tests for SQLAlchemy models in app/models.py."""

import json

from app import db
from app.models import User, Project, Suite, Section, TestCase


class TestUserModel:
    """Tests for the User model."""

    def test_set_password_hashes_password(self, app):
        """set_password should store a hash, not the plaintext password."""
        with app.app_context():
            user = User(username="alice", email="alice@example.com")
            user.set_password("Secret123")
            assert user.password_hash is not None
            assert user.password_hash != "Secret123"

    def test_check_password_correct(self, app):
        """check_password returns True for the correct password."""
        with app.app_context():
            user = User(username="alice", email="alice@example.com")
            user.set_password("Secret123")
            assert user.check_password("Secret123") is True

    def test_check_password_wrong(self, app):
        """check_password returns False for an incorrect password."""
        with app.app_context():
            user = User(username="alice", email="alice@example.com")
            user.set_password("Secret123")
            assert user.check_password("WrongPass") is False

    def test_to_dict_fields(self, app):
        """to_dict should return the expected keys."""
        with app.app_context():
            user = User(username="alice", email="alice@example.com")
            user.set_password("Secret123")
            db.session.add(user)
            db.session.commit()

            d = user.to_dict()
            assert d["id"] == user.id
            assert d["username"] == "alice"
            assert d["email"] == "alice@example.com"
            assert "created_at" in d
            assert "password_hash" not in d

    def test_to_dict_avatar_none(self, app):
        """to_dict avatar should be None when no avatar is set."""
        with app.app_context():
            user = User(username="alice", email="alice@example.com")
            user.set_password("Secret123")
            db.session.add(user)
            db.session.commit()

            d = user.to_dict()
            assert d["avatar"] is None

    def test_to_dict_avatar_path(self, app):
        """to_dict avatar should return a URL path when avatar is set."""
        with app.app_context():
            user = User(username="alice", email="alice@example.com", avatar="abc123.png")
            user.set_password("Secret123")
            db.session.add(user)
            db.session.commit()

            d = user.to_dict()
            assert d["avatar"] == "/api/auth/avatars/abc123.png"


class TestProjectModel:
    """Tests for the Project model."""

    def test_to_dict_fields(self, app):
        """to_dict should return the expected keys."""
        with app.app_context():
            user = User(username="alice", email="alice@example.com")
            user.set_password("Secret123")
            db.session.add(user)
            db.session.flush()

            project = Project(name="My Project", description="Desc", created_by=user.id)
            db.session.add(project)
            db.session.commit()

            d = project.to_dict()
            assert d["id"] == project.id
            assert d["name"] == "My Project"
            assert d["description"] == "Desc"
            assert d["created_by"] == user.id
            assert "created_at" in d
            assert "updated_at" in d

    def test_cascade_delete_removes_suites(self, app):
        """Deleting a project should cascade-delete its suites."""
        with app.app_context():
            project = Project(name="My Project", description="Desc")
            db.session.add(project)
            db.session.flush()

            suite = Suite(project_id=project.id, name="Suite 1")
            db.session.add(suite)
            db.session.commit()

            suite_id = suite.id
            db.session.delete(project)
            db.session.commit()

            assert Suite.query.get(suite_id) is None


class TestTestCaseModel:
    """Tests for the TestCase model."""

    def test_steps_list_parses_json(self, app):
        """steps_list property should parse the JSON string in 'steps'."""
        with app.app_context():
            project = Project(name="P")
            db.session.add(project)
            db.session.flush()
            suite = Suite(project_id=project.id, name="S")
            db.session.add(suite)
            db.session.flush()
            section = Section(suite_id=suite.id, name="Sec")
            db.session.add(section)
            db.session.flush()

            steps_data = [{"action": "Click", "expected": "Result"}]
            case = TestCase(
                suite_id=suite.id,
                section_id=section.id,
                title="TC1",
                steps=json.dumps(steps_data),
            )
            db.session.add(case)
            db.session.commit()

            assert case.steps_list == steps_data

    def test_steps_list_setter(self, app):
        """steps_list setter should serialize a list to JSON."""
        with app.app_context():
            project = Project(name="P")
            db.session.add(project)
            db.session.flush()
            suite = Suite(project_id=project.id, name="S")
            db.session.add(suite)
            db.session.flush()
            section = Section(suite_id=suite.id, name="Sec")
            db.session.add(section)
            db.session.flush()

            case = TestCase(suite_id=suite.id, section_id=section.id, title="TC2")
            steps_data = [{"action": "Step1", "expected": "Exp1"}]
            case.steps_list = steps_data
            db.session.add(case)
            db.session.commit()

            assert json.loads(case.steps) == steps_data

    def test_steps_list_none_returns_empty(self, app):
        """steps_list should return an empty list when steps is None."""
        with app.app_context():
            project = Project(name="P")
            db.session.add(project)
            db.session.flush()
            suite = Suite(project_id=project.id, name="S")
            db.session.add(suite)
            db.session.flush()
            section = Section(suite_id=suite.id, name="Sec")
            db.session.add(section)
            db.session.flush()

            case = TestCase(suite_id=suite.id, section_id=section.id, title="TC3", steps=None)
            db.session.add(case)
            db.session.commit()

            assert case.steps_list == []

    def test_to_dict_includes_parsed_steps(self, app):
        """to_dict should include the parsed steps list, not raw JSON."""
        with app.app_context():
            project = Project(name="P")
            db.session.add(project)
            db.session.flush()
            suite = Suite(project_id=project.id, name="S")
            db.session.add(suite)
            db.session.flush()
            section = Section(suite_id=suite.id, name="Sec")
            db.session.add(section)
            db.session.flush()

            steps_data = [{"action": "Do X", "expected": "Y happens"}]
            case = TestCase(
                suite_id=suite.id,
                section_id=section.id,
                title="TC4",
                steps=json.dumps(steps_data),
            )
            db.session.add(case)
            db.session.commit()

            d = case.to_dict()
            assert d["steps"] == steps_data
            assert isinstance(d["steps"], list)


class TestSectionModel:
    """Tests for the Section model."""

    def test_self_referential_parent_child(self, app):
        """A section can have a parent_id pointing to another section."""
        with app.app_context():
            project = Project(name="P")
            db.session.add(project)
            db.session.flush()
            suite = Suite(project_id=project.id, name="S")
            db.session.add(suite)
            db.session.flush()

            parent = Section(suite_id=suite.id, name="Parent Section")
            db.session.add(parent)
            db.session.flush()

            child = Section(suite_id=suite.id, name="Child Section", parent_id=parent.id)
            db.session.add(child)
            db.session.commit()

            assert child.parent_id == parent.id
            assert child in parent.children

    def test_to_dict_includes_parent_id(self, app):
        """to_dict should include parent_id (None for root, int for child)."""
        with app.app_context():
            project = Project(name="P")
            db.session.add(project)
            db.session.flush()
            suite = Suite(project_id=project.id, name="S")
            db.session.add(suite)
            db.session.flush()

            root = Section(suite_id=suite.id, name="Root")
            db.session.add(root)
            db.session.flush()

            child = Section(suite_id=suite.id, name="Child", parent_id=root.id)
            db.session.add(child)
            db.session.commit()

            root_dict = root.to_dict()
            child_dict = child.to_dict()

            assert root_dict["parent_id"] is None
            assert child_dict["parent_id"] == root.id
            assert child_dict["suite_id"] == suite.id
            assert child_dict["name"] == "Child"
