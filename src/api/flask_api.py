from flask import Flask, request, jsonify
from flask_cors import CORS
import logging

# Import your existing chatbot logic
from src.Text2SQL_V2.chatbot_api import run_chatbot_query

# -------------------------------------------------
# App setup
# -------------------------------------------------
app = Flask(__name__)
CORS(app)  # allow frontend to call this API

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# -------------------------------------------------
# Health check
# -------------------------------------------------
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200


# -------------------------------------------------
# Text2SQL main endpoint
# -------------------------------------------------
@app.route("/query", methods=["POST"])
def query():
    try:
        payload = request.get_json(force=True)
        question = payload.get("question")

        if not question or not isinstance(question, str):
            return jsonify({
                "error": "Invalid request. 'question' must be a string."
            }), 400

        logger.info(f"Received question: {question}")

        # 🔹 Call your real chatbot
        result = run_chatbot_query(question)

        # result already matches frontend expectations
        return jsonify(result), 200

    except Exception as e:
        logger.exception("Query failed")
        return jsonify({
            "error": "Internal server error",
            "details": str(e)
        }), 500


# -------------------------------------------------
# Entry point
# -------------------------------------------------
if __name__ == "__main__":
    # IMPORTANT: use 0.0.0.0 for Docker / production
    app.run(host="0.0.0.0", port=8000, debug=True)
