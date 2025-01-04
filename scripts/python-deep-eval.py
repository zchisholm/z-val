import json
from deepeval import evaluate

def handler(request):
    body = request.get_json()
    response = body["response"]
    reference = body.get("reference", "")
    
    results = {
        "factuality_score": 90.0,
        "relevance_score": 80.0
    }

    return {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(results),
    }
