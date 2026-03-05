import sys
import os

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db

app = create_app()

with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(debug=True, port=5001)
