from pydantic import BaseModel, Field
from typing import Literal, Optional

class LogEntry(BaseModel):
    timestamp: str
    level: Literal["INFO", "WARNING", "ERROR", "CRITICAL"]
    source: str
    message: str
    context: dict = Field(default_factory=dict)

class Verdict(BaseModel):
    severity: int = Field(ge=0, le=10, description="0=None, 10=Critical")
    is_anomaly: bool
    diagnosis: str
    recommended_action: Literal["NONE", "ALERT", "RESTART_SERVICE", "ISOLATE_MODULE"]
