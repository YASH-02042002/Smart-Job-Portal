from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from database import user_col
from bson import ObjectId
import bcrypt

auth_bp = Blueprint("auth", __name__)
def clean_user(user):
  """Removed password before sending user data to frontend."""
  user["_id"] = str(user["_id"])
  user.pop("password", None)
  return user

@auth_bp.route("/register", methods=["POST"])
def register():
  data = request.get_json()
  
  name = data.get("name", "").strip()
  email = data.get("email", "").strip().lower()
  password = data.get("password", "")
  role = data.get("role", "seeker")  # "seeker" or "admin"

  if not name or not email or not password:
    return jsonfiy({"error": "Sab fields required hain"}), 400

  if user_col.find_one({"email": email}):
    return jsonify({"error": "Email already registered hai"}), 409

  hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())

  user = {
    "name": name,
    "email": email,
    "password": hashed,
    "role": role,
    "resume": None,
    "phone": data.get("phone", ""),
    "skills": data.get("skills", []),
  }
  
  result = user_col.insert_one(user)
  user["_id"] = str(result.inserted_id)
  user.pop("password")

  token = create_access_token(identity={"id": user["_id"], "role": role})
  return jsonify({"token": token, "user": user}), 201

@auth_bp.route("/login", methods=["POST"])
def login():
  data = request.get_json()

  email = data.get("email", "").strip().lower()
  password = data.get("password", "")

  user = users_col.find_one({"email": email})
  if not user:
    return jsonify({"error": "Email ya password galat hai"}), 401

  if not bcrypt.checkpw(password.encode(), user["password"]):
    return jsonify({"error": "Email ya password galat hai"}), 401

  uid = str(user["_id"])
  role = user.get("role", "seeker")
  token = create_access_token(identity={"id": uid, "role": role})
  return jsonify({"token": token, "user": clean_user(user)}), 200

@auth_bp.route("/profile", methods=["POST"])
def profile():
  # Protected via JWT on frontend; decode and fetch
  from flask_jwt_extended import jwt_required, get_jwt_identity
  pass # handled separately if needed
  
