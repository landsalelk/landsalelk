"""
This module contains the IntegrityManager class, which is the central
orchestrator for the system integrity monitoring module.
"""
import asyncio
import yaml
import os
import logging
from .schemas import LogEntry
from .ai_analyzer import analyze
import src.core.modules.integrity.healing_actions as healing_actions

class IntegrityManager:
    """
    Orchestrates the monitoring of system logs, analysis of anomalies,
    and execution of healing actions.
    """
    def __init__(self, config_path='config/integrity_config.yaml'):
        """
        Initializes the IntegrityManager.

        Args:
            config_path (str, optional): The path to the configuration file.
                Defaults to 'config/integrity_config.yaml'.
        """
        self.log_buffer = asyncio.Queue()
        self._internal_state = {"critical_data": "initial_state_checksum"}
        self.config = self._load_config(config_path)
        self.severity_threshold = self.config.get('sensitivity_thresholds', {}).get('severity', 7)
        self.allowed_actions = self.config.get('allowed_actions', ["ALERT"])

    def _load_config(self, config_path):
        """
        Loads the configuration from a YAML file.

        Args:
            config_path (str): The path to the configuration file.

        Returns:
            dict: The loaded configuration.
        """
        if not os.path.exists(config_path):
            logging.warning(f"Config file not found at {config_path}. Using default values.")
            return {}
        with open(config_path, 'r') as f:
            return yaml.safe_load(f)

    async def monitor(self):
        """
        Continuously monitors the log buffer, analyzes log entries, and
        triggers healing actions when an anomaly is detected.
        """
        while True:
            log_entry = await self.log_buffer.get()
            verdict = analyze(log_entry)

            if verdict.is_anomaly or verdict.severity > self.severity_threshold:
                healing_actions.log_incident(verdict)
                action = verdict.recommended_action

                if action in self.allowed_actions:
                    if action == "RESTART_SERVICE":
                        healing_actions.restart_module(log_entry.source)
                    elif action == "ALERT":
                        healing_actions.alert_user(f"Anomaly detected in {log_entry.source}: {verdict.diagnosis}")
                else:
                    healing_actions.alert_user(f"Recommended action '{action}' not allowed. Defaulting to ALERT.")

            self.log_buffer.task_done()

    async def verify_system_state(self):
        """
        Performs a manual check of the system's internal state to ensure
        that critical data structures have not been corrupted.
        """
        logging.info("Performing manual integrity check...")
        if self._internal_state.get("critical_data") == "initial_state_checksum":
            logging.info("System Status: Nominal")
        else:
            logging.error("Issues Detected: Internal state has been corrupted.")
            healing_actions.alert_user("Internal state corruption detected!")
