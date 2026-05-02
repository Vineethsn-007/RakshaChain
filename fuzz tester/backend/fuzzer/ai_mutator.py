"""
fuzzer/ai_mutator.py
AI-driven dynamic mutation engine.
Uses OpenRouter to generate targeted payloads based on server error messages.
"""

from __future__ import annotations
import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")

def get_ai_targeted_payloads(endpoint: str, method: str, original_payload: dict, error_message: str) -> list[dict]:
    """
    Asks the AI to analyze a validation error and generate payloads to bypass it.
    """
    prompt = f"""
    I am fuzz testing an API endpoint: {method} {endpoint}
    I sent this payload: {json.dumps(original_payload)}
    The server returned this error: "{error_message}"
    
    As a security researcher, generate 5-8 new JSON payloads that specifically target this validation logic. 
    Try to find edge cases, type confusion, or bypasses for the specific constraint mentioned in the error.
    
    Return ONLY a raw JSON list of objects. No explanation.
    Example: [{"field": "value1"}, {"field": "value2"}]
    """

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "AI Fuzz Tester Mutator"
    }
    
    data = {
        "model": "openai/gpt-4o-mini",
        "messages": [
            {"role": "system", "content": "You are a professional security researcher. Return only valid JSON."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7
    }
    
    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=data,
            timeout=15
        )
        response.raise_for_status()
        content = response.json()["choices"][0]["message"]["content"]
        
        # Strip potential markdown code blocks
        content = content.strip().replace("```json", "").replace("```", "")
        
        payloads = json.loads(content)
        if isinstance(payloads, list):
            # Tag them so the engine knows they are AI-generated
            for p in payloads:
                p["_meta"] = {"category": "ai_dynamic", "parent_error": error_message}
            return payloads
    except Exception as e:
        print(f"AI Mutation Error: {e}")
        return []

    return []
