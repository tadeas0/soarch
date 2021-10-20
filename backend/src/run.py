from app import create_app
import os


if __name__ == "__main__":
    create_app().run(host="0.0.0.0", port=os.environ.get("PORT", 8080), debug=True)
