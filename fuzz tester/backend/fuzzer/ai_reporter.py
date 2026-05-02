"""
fuzzer/ai_reporter.py
Generates a detailed markdown report using OpenRouter API,
including mitigation strategies for the found vulnerabilities.
"""

from __future__ import annotations
import os
import requests
import json
from dotenv import load_dotenv
from fuzzer.logger import get_all_crashes, get_report

load_dotenv()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")


def generate_ai_report() -> str:
    """Gathers crash data and calls OpenRouter to generate a professional remediation report."""
    
    # 1. Gather the data
    stats = get_report()
    crashes = get_all_crashes(limit=50) 
    
    if stats["total"] == 0:
        return "# 🛡️ Security Scan Report\n\n**Status:** PASSED\n\nNo vulnerabilities were discovered during this automated scan session."

    # Group unique vulnerabilities by endpoint and crash_type
    unique_vulns = {}
    for c in crashes:
        key = f"{c['method']} {c['endpoint']} - {c['crash_type']}"
        if key not in unique_vulns:
            unique_vulns[key] = {
                "endpoint": c["endpoint"],
                "method": c["method"],
                "crash_type": c["crash_type"],
                "severity": c["severity"],
                "sample_payload": c["input_payload"],
                "response_snippet": c.get("response_body", "")[:300]
            }

    # 2. Build the high-quality prompt
    system_message = (
        "You are a Principal Security Researcher at a top cybersecurity firm. "
        "Your task is to write a humanized, professional, and authoritative 'Security Remediation Report' "
        "based on the results of an automated fuzzing session. "
        "The report must be clear, actionable, and formatted in clean GitHub-Flavored Markdown."
    )

    prompt = f"""
    ### RAW DATA FOR ANALYSIS:
    Total Crashes Found: {stats['total']}
    Severity Distribution: {json.dumps(stats['by_severity'])}
    
    ### DISCOVERED VULNERABILITIES:
    """
    
    for v in unique_vulns.values():
        prompt += f"""
        ---
        Endpoint: {v['method']} {v['endpoint']}
        Detected As: {v['crash_type']}
        Severity: {v['severity']}
        Evidence (Payload): {v['sample_payload']}
        Evidence (Response): {v['response_snippet']}
        """

    prompt += """
    
    ### INSTRUCTIONS FOR THE REPORT:
    Please structure the final report as follows:
    1.  **EXECUTIVE SUMMARY**: A high-level overview of the security posture. Speak like a professional advisor to a CTO.
    2.  **VULNERABILITY BREAKDOWN**: A detailed analysis of each UNIQUE vulnerability found. 
        - Include "Impact Analysis" (what could a real attacker do?).
        - Include "Reproduction Steps" (how can a developer verify this manually?).
    3.  **TECHNICAL REMEDIATION PLAN**: Provide specific, clean code examples (Python/JS/Java) to fix these issues. 
        - Focus on input validation, sanitization, and error handling.
    4.  **CONCLUSION**: Final thoughts on the application's security hygiene.

    Use professional, encouraging, yet urgent language where necessary. Avoid robotic repetition.
    """

    # 3. Call OpenRouter
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "AI Fuzzer Professional Reporter"
    }
    
    data = {
        "model": "openai/gpt-4o-mini", 
        "messages": [
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.3 # Lower temperature for more stable, professional reports
    }
    
    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=data,
            timeout=40
        )
        response.raise_for_status()
        result = response.json()
        ai_content = result["choices"][0]["message"]["content"]
        
        # Build the final header
        header = f"# 🛡️ Security Audit: Autonomous Fuzzing Report\n\n"
        header += f"*Generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*\n\n"
        
        # Use a table for the stats
        header += "### 📊 Scan Statistics\n\n"
        header += "| Metric | Value |\n"
        header += "| :--- | :--- |\n"
        header += f"| **Total Security Events** | {stats['total']} |\n"
        for sev, count in stats['by_severity'].items():
            header += f"| {sev} Severity | {count} |\n"
        header += "\n---\n\n"
        
        return header + ai_content

    except Exception as e:
        # Fallback if API fails
        return f"# Security Scan Report\n\nTotal Crashes: {stats['total']}\n\n*Error generating AI remediation: {str(e)}*\n\nPlease check the OpenRouter API key or network connection."
