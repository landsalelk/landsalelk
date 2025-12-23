from .schemas import Verdict
import time

LAST_RESTART_TIME = {}

def alert_user(message: str):
    """Pushes a notification to the UI/Notification system."""
    print(f"ALERT: {message}")

def restart_module(module_name: str):
    """Gracefully stops and starts a specific agent module."""
    current_time = time.time()
    if module_name in LAST_RESTART_TIME and (current_time - LAST_RESTART_TIME[module_name]) < 300:
        alert_user(f"Restart of {module_name} is rate-limited.")
        return
    print(f"ACTION: Restarting module {module_name}...")
    LAST_RESTART_TIME[module_name] = current_time
    # In a real scenario, this would interact with a module management system.

def log_incident(verdict: Verdict):
    """Writes to incident_logs.db or a logging service."""
    print(f"INCIDENT: {verdict.diagnosis} (Severity: {verdict.severity})")
