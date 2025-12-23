"""
This module defines the set of automated healing actions that can be
taken in response to a detected system anomaly.
"""
from .schemas import Verdict
import time
import logging

LAST_RESTART_TIME = {}

def alert_user(message: str):
    """
    Logs a warning-level alert to notify an operator of an issue.

    Args:
        message (str): The alert message to log.
    """
    logging.warning(message)

def restart_module(module_name: str):
    """
    Simulates gracefully stopping and starting a specific agent module.

    This function includes a rate-limiting mechanism to prevent cascading
    restarts.

    Args:
        module_name (str): The name of the module to restart.
    """
    current_time = time.time()
    if module_name in LAST_RESTART_TIME and (current_time - LAST_RESTART_TIME.get(module_name, 0)) < 300:
        logging.warning(f"Restart of module '{module_name}' is rate-limited.")
        return
    logging.info(f"Restarting module: {module_name}...")
    LAST_RESTART_TIME[module_name] = current_time
    # In a real scenario, this would interact with a module management system.

def log_incident(verdict: Verdict):
    """
    Logs a critical-level incident for later investigation.

    Args:
        verdict (Verdict): The verdict containing the details of the incident.
    """
    logging.critical(f"Incident detected - Diagnosis: {verdict.diagnosis} (Severity: {verdict.severity})")
