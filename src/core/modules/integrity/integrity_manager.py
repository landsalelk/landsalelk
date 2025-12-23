import asyncio
import yaml
import os
import logging
from .schemas import LogEntry
from .ai_analyzer import analyze
from .healing_actions import alert_user, restart_module, log_incident

class IntegrityManager:
    def __init__(self, config_path='config/integrity_config.yaml'):
        self.log_buffer = asyncio.Queue()
        self._internal_state = {"critical_data": "initial_state_checksum"}
        self.config = self._load_config(config_path)
        self.severity_threshold = self.config.get('sensitivity_thresholds', {}).get('severity', 7)
        self.allowed_actions = self.config.get('allowed_actions', ["ALERT"])

    def _load_config(self, config_path):
        """Loads the configuration from a YAML file."""
        if not os.path.exists(config_path):
            logging.warning(f"Config file not found at {config_path}. Using default values.")
            return {}
        with open(config_path, 'r') as f:
            return yaml.safe_load(f)

    async def monitor(self):
        """Monitors the log buffer and takes action on anomalies."""
        while True:
            log_entry = await self.log_buffer.get()
            verdict = analyze(log_entry)

            if verdict.is_anomaly or verdict.severity > self.severity_threshold:
                log_incident(verdict)
                action = verdict.recommended_action

                if action in self.allowed_actions:
                    if action == "RESTART_SERVICE":
                        restart_module(log_entry.source)
                    elif action == "ALERT":
                        alert_user(f"Anomaly detected in {log_entry.source}: {verdict.diagnosis}")
                else:
                    alert_user(f"Recommended action '{action}' not allowed. Defaulting to ALERT.")

            self.log_buffer.task_done()

    async def verify_system_state(self):
        """Performs a manual check of the system's internal state."""
        logging.info("Performing manual integrity check...")
        if self._internal_state.get("critical_data") == "initial_state_checksum":
            logging.info("System Status: Nominal")
        else:
            logging.error("Issues Detected: Internal state has been corrupted.")
            alert_user("Internal state corruption detected!")
