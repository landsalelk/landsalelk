import os
import json
import subprocess
import asyncio
from bot import call_openrouter, create_github_issue, SYSTEM_PROMPT_TASK

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)
SNAPSHOT_FILE = os.path.join(BASE_DIR, "ux_snapshots.json")

def run_ux_dump():
    print("📸 Capturing UX Snapshots via Playwright...")
    try:
        subprocess.run(
            "npx playwright test tests/e2e/ux-dump.spec.js",
            shell=True,
            cwd=PROJECT_ROOT,
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Snapshot capture failed: {e.stderr.decode()}")
        return False

async def analyze_page(url, data):
    print(f"🤖 [Sub-Bot-{url}] Analyzing {url}...")
    prompt = f"""
    You are a **Senior UX Researcher**. I will provide you with the 'Accessibility Tree' and Content Summary of a webpage.

    **Your Goal:** Identify usability issues causing user confusion.

    **Analyze for:**
    1.  **Clarity**: Are buttons/links labeled descriptively (e.g., 'Click here' vs 'View Properties')?
    2.  **Navigation**: Is the hierarchy (headings) logical?
    3.  **Friction**: Are there too many steps or confusing layout choices?

    **Page Context:**
    - URL: {data['url']}
    - Title: {data['title']}

    **Data:**
    ```json
    {json.dumps(data['accessibilityTree'], indent=2)[:3000]}
    ```
    (Truncated for brevity)

    **Output:**
    Provide 3 specific, actionable recommendations to improve clarity and engagement.
    """

    # Use Async call
    analysis = await call_openrouter(SYSTEM_PROMPT_TASK, prompt)

    return f"## Page: `{url}`\n**Title**: {data['title']}\n\n{analysis}\n\n---\n\n"

async def analyze_ux_parallel():
    if not os.path.exists(SNAPSHOT_FILE):
        print("❌ Snapshot file not found.")
        return

    with open(SNAPSHOT_FILE, 'r') as f:
        snapshots = json.load(f)

    report = "# 🕵️ UX/UI Usability Audit Report (Swarm Mode)\n\n"

    # Spawn Sub-Bots
    tasks = []
    for url, data in snapshots.items():
        tasks.append(analyze_page(url, data))

    print(f"🚀 Launching {len(tasks)} Sub-Bots for parallel analysis...")
    results = await asyncio.gather(*tasks)

    report += "".join(results)
    return report

if __name__ == "__main__":
    if run_ux_dump():
        # Need to run async loop
        from bot import call_openrouter # Import async version
        full_report = asyncio.run(analyze_ux_parallel())
        print(full_report)
