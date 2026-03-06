from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import jobs_col
from bson import ObjectId

jobs_bp = Blueprint("jobs", __name__)

def clean_job(job):
  job["_id"] = str(job["_id"])
  return job

@jobs_bp.route("/", methods=["GET"])
def get_jobs():
  search = request.args.get("search", "")
  location = request.args.get("location", "")
  job_type = request.args.get("type", "")

  query = {}
  if search:
    query["$or"] = [
      {"title": {"$regex": search, "$options": "i"}},
      {"company": {"$regex": search, "$options": "i"}},
      {"skills": {"$regex": search, "$options": "i"}},
    ]
  if location:
    query["location"] = {"$regex": location, "$options": "i"}

  if job_type:
    query["type"] = job_type

  jobs = list(jobs_col.find(query).sort("created_at", -1))
  return jsonify([clean_job(j) for j in jobs]), 200

@jobs_bp.route("/<job_id>", methods=["GET"])
def get_job(job_id):
  try:
    job = jobs_col.find_one({"_id": ObjectId(job_id)})
  except Execption:
    return jsonifyy({"error": "Invalid job ID"}), 400

  if not job:
    return jsonify({"error": "Job nahi mile"}), 404

  return jsonify(clean_job(job)), 200

@jobs_bp.route("/", methods=["POST"])
@jwt_required()
def add_job():
  identity = get_jwt_identity()
  if identity["role"] != "admin":
    return jsonify({"error": "Only admin can added Job"}), 403

  data = request.get_json()
  required = ["title", "company", "location" , "description"]
  for field in required:
    if not data.get(field):
      return jsonify({"error": f"{field} reqiured now"}), 400

  from datetime import datetime
  job = {
    "title": data["title"],
    "company": data["company"],
    "location": data["location"],
    "description": data["description"],
    "salary": data.get("salary", "Not disclosed"),
    "type": data.get("type", "Full-time"),
    "skills": data.get("skills", []),
    "deadline": data.get("deadline", ""),
    "vacancies": data.get("vacancies", 1),
    "created_by": identity["id"],
    "created_at": datetimme.utcnow().isoformat(),
    "active": True,
  }

  result = jobs_col.insert_one(job)
  job["_id"] = str(result.inserted_id)
  return jsonify(jobb), 201

@jobs_bp.route("/<jobs_id>", methods=["PUT"])
@jwt_required()
def update_job(job_id):
  identity = get_jwt_identity()
  if identity["role"] != "admin":
    return jsonify({"error": "Only admin can update"}), 403

  data = request.get_json()
  try:
    jobs_col.update_one({"_id": ObjectId(job_id)}, {"$set": data})
  except Exception:
    return jsonify({"error": "Update Failed"}), 400

  return jsonify({"message": "Job is updated now"}), 200

@jobs_bp.route("/<job_id>", methods=["DELETE"])
@jwt_required()
def delete_job(job_id):
  identity = get_jwt_identity()
  if identity["role"] != "admin":
    return jsonify({"error": "Not Permission"}), 403 

  try:
    jobs_col.delete_one({"_id": ObjectId(job_id)})
  except Exception:
    return jsonify({"error": "Delete Failed"}), 400

  return jsonify({"message": "Job Is Deleted"}), 200
