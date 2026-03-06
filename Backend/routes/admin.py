
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import users_col, jobs_col, applications_col
from bson import ObjectId

admin_bp = Blueprint("admin", __name__)

def require_admin(identity):
  return identity.get("role") == "admin"

@admin_bp.route("/stats", methods=["GET"])
@jwt_required()
def stats():
  identity = get_jwt_identity()
  if not require_admin(identity):
    return jsonify({"error": "Access Denied"}), 403

  total_users = users_col.count_documents({"role": "seeker"})
  total_jobs = jobs_col.count_documents({})
  total_apps = applications_col.count_documents({})
  selected = applications_col.count_documents({"status": "Selected"})
  rejected = applications_col.count_documents({"status": "Rejected"})
  reviewing = applications_col.count_documents({"status": "Reviewing"})
  interview = applications_col.count_documents({"status": "Interview"})

  return jsonify({
    "total_users": total_users,
    "total_jobs": total_jobs,
    "total_apps": total_apps,
    "selected": selected,
    "rejected": rejected,
    "reviewing": reviewing,
    "interview": interview,
  }), 200

@admin_bp.route("/applications", methods=["GET"])
@jwt_required()
def all_applications():
  identity = get_jwt_identity()
  if not require_admin(identity):
    return jsonify({"error": "Access Denied"}), 403

  apps = list(applications_col.find().sort("applied_at", -1))
  for a in apps:
    a["_id"] = str(a["_id])
    try:
      user = users_col.find_one({"_id": ObjectId(a["user_id"])}, {"name": 1, "email": 1, "phone": 1
      if user:
        user["_id"] = str(user["_id"])
        a["user_info"] = user
    except Exception:
      pass
  return jsonify(apps), 200

@admin_bp.route("/users", methods=["GET"])
@jwt_required()
def all_users():
  identity = get_jwt_identity()
  if not require_admin(identity):
    return jsonify({"error": "Access Denied"}), 403

  users = list(users_col.find({"role": "seeker"}, {"password": 0}))
  for u in users:
    u["_id"] = str(u["_id"])

  return jsonify(users), 200
