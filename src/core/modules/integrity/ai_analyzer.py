"""
This module contains the logic for analyzing log entries and generating
a verdict on whether they represent an anomaly.
"""
from .schemas import LogEntry, Verdict

def analyze(log: LogEntry) -> Verdict:
    """
    Analyzes a log entry and returns a deterministic verdict based on predefined rules.

    Args:
        log (LogEntry): The log entry to analyze.

    Returns:
        Verdict: The verdict of the analysis.
    """
    message_lower: str = log.message.lower()

    if "exception" in message_lower or log.level == "CRITICAL":
        return Verdict(
            severity=9,
            is_anomaly=True,
            diagnosis="A critical exception or error was detected.",
            recommended_action="RESTART_SERVICE"
        )

    if "timeout" in message_lower or log.level == "ERROR":
        return Verdict(
            severity=7,
            is_anomaly=True,
            diagnosis="A timeout or error was detected, suggesting a connectivity or performance issue.",
            recommended_action="ALERT"
        )

    if "leak" in message_lower:
        return Verdict(
            severity=8,
            is_anomaly=True,
            diagnosis="Potential memory leak detected from log message.",
            recommended_action="RESTART_SERVICE"
        )

    return Verdict(
        severity=1,
        is_anomaly=False,
        diagnosis="System nominal.",
        recommended_action="NONE"
    )
