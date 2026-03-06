from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import applications_col, jobs_col, users_col
from bson import ObjectId
from datetime import datetime
import os, base64

app_bp = Blueprint("applications", __name__)

def clean(doc):
  doc["_id"] = str(doc["_id"])
  return doc

@app_bp.route("/apply", methods=["POST"])
@jwt_required()
def apply_job():
  identity = get_jwt_identity()
  user_id = identity["id"]
  data = request.get_json()
  job_id = data.get("job_id")

  if not job_id:
    return jsonify({"error": "Need job_id"}), 400

  existing = applications_col.find_one({"user_id": user_id, "job_id": job_id})
  if existing:
    return jsonify({"error": "You have already Apply"}), 409

  try:
    job = jobs_col.find_one({"_id"}: ObjectId(job_id)})
  except Exception:
    return jsonify({"error": "Didn't get the job"}), 404

  if not job:
    return jsonify({"error": "The job does not exist"}), 404

  application = {
    "user_id": user_id,
    "job_id": job_id,
    "job_title": job["title"],
    "company": job["comapny"],
    "status": "Applied",
    "cover_letter"; data.get("cover_letter", ""),
    "applied_at": datetime.utcnow().isoformat(),
    "updated_at": datetime.utcnow().isoformat(),
  }

  result = application_col.insert_one(application)
  application["_id"] = str(result.inserted_id)
  return jsonify(application), 201

@app_bp.route("/my", methods=["GET"])
@jwt_required()
def my_applications():
  identity = get_jwt_identity()
  apps = list(applications_col.find({"user_id": identity["id"]}).sort("applied_at", -1))
  return jsonify([clean(a) for a in apps]), 200

@app_bp.route("/<app_id>/status", methods=["PUT"])
@jwt_required()
def update_status(app_id):
  identity = get_jwt_identity()
  if identity["role"] != "admin":
    return jsonify({"error"; "Only admin can change the status"}), 403

  data = request.get_json()
  new_status = data.get("status")

  valid = ["Applied", "Reviewing", "Interview", "Selected", "Rejected"]
  if new_status not in valid:
    return jsonify({"error": f"Status Must b one of {valid}"), 400
  try:
    applicataions_col.update_one(
      {"_id": ObjectId(app_id)},
      {"$set": {"Status": new_status, "updated_at": datetime.utcnow().isoformat()}}
    )
  except Execption:
    return jsonify({"error": "Update failed"}), 400

  return jsonify({"message": f"status '{new_status}' is seted now"}), 200

@app_bp.route("/resume", methods=["POST"])
@jwt_required()
def upload_resume():
  """Store resume as base64 in MongoDB(small files only; use S3/Cloudinary for prod)."""
  identity = get_jwt_identity()
  file = request.files.get("resume")

  if not file :
    return jsonify({"error": "Could not find File"}), 400

  if not file.filename.endswitch(".pdf"):
    return jsonify({"error": "Only Upload PDF"}), 400

  encoded = base64.b64encode(file.read()).decode("utf-8")

  users_col.update_one(
    {"_id": ObjectId(identity["id"])},
    {"$set": {"resume": encoded, "resume_name": file.filename}}
  )

  return jsonify({"message": "Resume is Uploaded"}), 200  
