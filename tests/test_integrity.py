import unittest
from unittest.mock import patch
import asyncio
from src.core.modules.integrity.schemas import LogEntry, Verdict
from src.core.modules.integrity.ai_analyzer import analyze
from src.core.modules.integrity.healing_actions import restart_module, LAST_RESTART_TIME
from src.core.modules.integrity.integrity_manager import IntegrityManager
from pydantic import ValidationError

class TestIntegritySystem(unittest.TestCase):

    def test_log_injection_and_analyzer_response(self):
        """Test that the AI analyzer correctly identifies anomalies."""
        log_entry = LogEntry(
            timestamp="2024-01-01T12:00:00",
            level="ERROR",
            source="test_module",
            message="Memory Leak detected"
        )
        verdict = analyze(log_entry)
        self.assertIsInstance(verdict, Verdict)
        self.assertGreater(verdict.severity, 5)
        self.assertTrue(verdict.is_anomaly)

    @patch('src.core.modules.integrity.healing_actions.logging.warning')
    def test_healing_rate_limit(self, mock_logging_warning):
        """Test that the restart_module action is rate-limited."""
        LAST_RESTART_TIME.clear()
        restart_module("rate_limit_test")
        for _ in range(9):
            restart_module("rate_limit_test")
        self.assertEqual(mock_logging_warning.call_count, 9)

    def test_schema_validation(self):
        """Test that the LogEntry schema raises a validation error for malformed data."""
        with self.assertRaises(ValidationError):
            LogEntry(
                timestamp="not-a-timestamp",
                level="INVALID_LEVEL",
                source="test",
                message="test"
            )

    def test_integrity_manager_flow(self):
        """Test the end-to-end flow of the IntegrityManager."""
        async def run_test():
            manager = IntegrityManager(config_path='config/integrity_config.yaml')
            monitor_task = asyncio.create_task(manager.monitor())

            log_entry = LogEntry(
                timestamp="2024-01-01T12:00:00",
                level="CRITICAL",
                source="e2e_test",
                message="A critical exception occurred."
            )

            with patch('src.core.modules.integrity.integrity_manager.healing_actions.log_incident') as mock_log, \
                 patch('src.core.modules.integrity.integrity_manager.healing_actions.restart_module') as mock_restart, \
                 patch('src.core.modules.integrity.integrity_manager.healing_actions.alert_user') as mock_alert:

                await manager.log_buffer.put(log_entry)
                await manager.log_buffer.join()

                monitor_task.cancel()
                try:
                    await monitor_task
                except asyncio.CancelledError:
                    pass

                mock_log.assert_called_once()
                # With the deterministic analyzer, a "CRITICAL" log should trigger a restart.
                mock_restart.assert_called_once()
                mock_alert.assert_not_called()

        asyncio.run(run_test())

if __name__ == '__main__':
    unittest.main()
