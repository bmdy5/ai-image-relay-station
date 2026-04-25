import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE users ADD COLUMN frozen_points INT DEFAULT 0 AFTER points"))
        print("Successfully added frozen_points column to users table.")
    except Exception as e:
        if "Duplicate column name" in str(e):
            print("Column frozen_points already exists.")
        else:
            print(f"Error adding column: {e}")
