import json

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app import db
from app.models import TestCase, Section, Suite

cases_bp = Blueprint("cases", __name__)


@cases_bp.route("/sections/<int:section_id>/cases", methods=["GET"])
@jwt_required()
def list_cases_by_section(section_id):
    Section.query.get_or_404(section_id)
    cases = TestCase.query.filter_by(section_id=section_id).order_by(TestCase.created_at).all()
    return jsonify([c.to_dict() for c in cases]), 200


@cases_bp.route("/suites/<int:suite_id>/cases", methods=["GET"])
@jwt_required()
def list_cases_by_suite(suite_id):
    Suite.query.get_or_404(suite_id)
    section_ids = [s.id for s in Section.query.filter_by(suite_id=suite_id).all()]
    if not section_ids:
        return jsonify([]), 200
    cases = TestCase.query.filter(TestCase.section_id.in_(section_ids)).order_by(TestCase.created_at).all()
    result = []
    for c in cases:
        d = c.to_dict()
        d["section_name"] = c.section.name if c.section else None
        result.append(d)
    return jsonify(result), 200


@cases_bp.route("/cases", methods=["POST"])
@jwt_required()
def create_case():
    data = request.get_json()
    title = data.get("title", "").strip()
    section_id = data.get("section_id")

    if not title or not section_id:
        return jsonify({"error": "Title and section_id are required"}), 400

    Section.query.get_or_404(section_id)

    case = TestCase(
        section_id=section_id,
        title=title,
        case_type=data.get("case_type", "Functional"),
        priority=data.get("priority", "Medium"),
        preconditions=data.get("preconditions", ""),
        expected_result=data.get("expected_result", ""),
        created_by=int(get_jwt_identity()),
    )
    if "steps" in data:
        case.steps = json.dumps(data["steps"])

    db.session.add(case)
    db.session.commit()
    return jsonify(case.to_dict()), 201


@cases_bp.route("/cases/<int:case_id>", methods=["GET"])
@jwt_required()
def get_case(case_id):
    case = TestCase.query.get_or_404(case_id)
    result = case.to_dict()
    result["section_name"] = case.section.name if case.section else None
    return jsonify(result), 200


@cases_bp.route("/cases/<int:case_id>", methods=["PUT"])
@jwt_required()
def update_case(case_id):
    case = TestCase.query.get_or_404(case_id)
    data = request.get_json()

    if "title" in data:
        case.title = data["title"].strip()
    if "section_id" in data:
        case.section_id = data["section_id"]
    if "case_type" in data:
        case.case_type = data["case_type"]
    if "priority" in data:
        case.priority = data["priority"]
    if "preconditions" in data:
        case.preconditions = data["preconditions"]
    if "steps" in data:
        case.steps = json.dumps(data["steps"])
    if "expected_result" in data:
        case.expected_result = data["expected_result"]

    db.session.commit()
    return jsonify(case.to_dict()), 200


@cases_bp.route("/cases/<int:case_id>", methods=["DELETE"])
@jwt_required()
def delete_case(case_id):
    case = TestCase.query.get_or_404(case_id)
    db.session.delete(case)
    db.session.commit()
    return jsonify({"message": "Test case deleted"}), 200
