from backend.models.database import engine
from sqlalchemy import text

def migrate():
    with engine.connect() as connection:
        print("Checking for invited_by_id column in users table...")
        try:
            # Check if column exists
            result = connection.execute(text("SHOW COLUMNS FROM users LIKE 'invited_by_id'"))
            if not result.fetchone():
                print("Adding invited_by_id column...")
                connection.execute(text("ALTER TABLE users ADD COLUMN invited_by_id INT NULL"))
                connection.execute(text("ALTER TABLE users ADD CONSTRAINT fk_invited_by FOREIGN KEY (invited_by_id) REFERENCES users(id)"))
                print("invited_by_id column added successfully.")
            else:
                print("invited_by_id column already exists.")
        except Exception as e:
            print(f"Migration error: {e}")

if __name__ == "__main__":
    migrate()
