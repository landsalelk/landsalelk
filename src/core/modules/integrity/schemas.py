"""
This module defines the Pydantic models used for data validation
in the system integrity monitoring module.
"""
from pydantic import BaseModel, Field
from typing import Literal, Dict, Any

class LogEntry(BaseModel):
    """
    Represents a single log entry.
    """
    timestamp: str
    level: Literal["INFO", "WARNING", "ERROR", "CRITICAL"]
    source: str
    message: str
    context: Dict[str, Any] = Field(default_factory=dict)

class Verdict(BaseModel):
    """
    Represents the verdict of an AI analysis of a log entry.
    """
    severity: int = Field(ge=0, le=10, description="0=None, 10=Critical")
    is_anomaly: bool
    diagnosis: str
    recommended_action: Literal["NONE", "ALERT", "RESTART_SERVICE", "ISOLATE_MODULE"]
