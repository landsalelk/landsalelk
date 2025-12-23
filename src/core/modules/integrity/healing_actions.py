from .schemas import Verdict
import time
import logging

LAST_RESTART_TIME = {}

def alert_user(message: str):
    """Logs a warning-level alert."""
    logging.warning(message)

def restart_module(module_name: str):
    """Gracefully stops and starts a specific agent module, with rate-limiting."""
    current_time = time.time()
    if module_name in LAST_RESTART_TIME and (current_time - LAST_RESTART_TIME[module_name]) < 300:
        logging.warning(f"Restart of module '{module_name}' is rate-limited.")
        return
    logging.info(f"Restarting module: {module_name}...")
    LAST_RESTART_TIME[module_name] = current_time
    # In a real scenario, this would interact with a module management system.

def log_incident(verdict: Verdict):
    """Logs a critical-level incident."""
    logging.critical(f"Incident detected - Diagnosis: {verdict.diagnosis} (Severity: {verdict.severity})")
