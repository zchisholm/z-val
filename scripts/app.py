# app.py
from flask import Flask, request, jsonify
from deepeval import evaluate
from deepeval.metrics import HallucinationMetric
from deepeval.test_case import LLMTestCase

app = Flask(__name__)

@app.route("/evaluate", methods=["POST"])
def evaluate_text():
    data = request.json
    response = data["response"]
    reference = data.get("reference", "")

    # do your metric
    # e.g. factuality_score = SomeMetric(response, reference)
    results = {
        "factuality_score": 90.0,
        "relevance_score": 80.0
    }
    return jsonify(results)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
