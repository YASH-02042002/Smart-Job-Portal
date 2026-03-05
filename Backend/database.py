from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/jobportal")

client = MongoClient(MONGO_URI)
db = client.get_default_database()

users_col = db["users"]
jobs_col = db["jobs"]
applications_col = db["applications"]
