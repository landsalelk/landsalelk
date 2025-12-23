# Jules AI - System Integrity Monitoring Module

This directory contains a standalone Python module for monitoring the system integrity of the Jules AI agent. It is designed to be run as a separate process or microservice, independent of the main Next.js application.

## Overview

The module consists of the following components:

- **`jules.py`**: The main entry point for the integrity monitoring service.
- **`modules/integrity/`**: Contains the core logic for the integrity monitor.
  - **`integrity_manager.py`**: The main orchestrator that monitors logs and triggers actions.
  - **`ai_analyzer.py`**: A deterministic, rule-based analyzer for log entries.
  - **`healing_actions.py`**: A set of actions that can be taken in response to anomalies.
  - **`schemas.py`**: Pydantic models for data validation.

## Running the Service

To run the integrity monitoring service, first install the required dependencies:

```bash
pip install -r requirements.txt
```

Then, run the main script as a module from the project root:

```bash
python -m src.core.jules
```

You can also perform a manual integrity check by running:

```bash
python -m src.core.jules --check-integrity
```
