from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
load_dotenv()

from routes.auth import auth_bp
from routes.jobs import jobs_bp
from routes.applications import app_bp
from routes.admin import admin_bp
app = Flask(__name__)

app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY","change-this-key")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = False

CORS(app, resources={r"/api/*": {"origins": "*"}})
JWTManager(app)

app.register_blueprint(auth_bp, prefix="/api/auth")
app.register_blueprint(jobs_bp, prefix="/api/jobs")
app.register_blueprint(app_bp, prefix="/api/applications")
app.register_blueprint(admin_bp, prefix="/api/admin")

@app.route("/")
def health():
  return{"status": "Job Portal API is Running..."}, 200

if __name__ == "__main__":
  prot = int(os.getenv("PORT", 5000))
  app.run(debug=True, port=port)
