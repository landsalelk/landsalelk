from .schemas import LogEntry, Verdict
import random

def analyze(log: LogEntry) -> Verdict:
    """
    Analyzes a log entry and returns a verdict.
    This is a simulated implementation.
    """
    if "exception" in log.message.lower() or "timeout" in log.message.lower() or log.level in ["ERROR", "CRITICAL"]:
        return Verdict(
            severity=random.randint(6, 10),
            is_anomaly=True,
            diagnosis="Detected a critical error in the logs.",
            recommended_action=random.choice(["RESTART_SERVICE", "ALERT"])
        )
    return Verdict(
        severity=random.randint(0, 2),
        is_anomaly=False,
        diagnosis="System nominal.",
        recommended_action="NONE"
    )
