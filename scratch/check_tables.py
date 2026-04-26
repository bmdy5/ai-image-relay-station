from sqlalchemy import create_engine, text
import os
import sys
from dotenv import load_dotenv

load_dotenv()

DB_URL = os.getenv("DATABASE_URL")

if not DB_URL:
    print("Error: Missing DATABASE_URL in .env")
    sys.exit(1)

try:
    engine = create_engine(DB_URL)
    with engine.connect() as conn:
        print(f"Checking tables in database...")
        result = conn.execute(text("SHOW TABLES;"))
        tables = [row[0] for row in result]
        print(f"Available tables: {tables}")
except Exception as e:
    print(f"Error: {e}")
