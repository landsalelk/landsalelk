import asyncio
import argparse
import datetime
import logging
import sys
from src.core.modules.integrity.integrity_manager import IntegrityManager
from src.core.modules.integrity.schemas import LogEntry

async def log_simulator(integrity_manager: IntegrityManager) -> None:
    """
    Simulates log entries being added to the integrity manager's buffer for demonstration.

    Args:
        integrity_manager (IntegrityManager): The instance of the integrity manager to add logs to.
    """
    await asyncio.sleep(2)
    await integrity_manager.log_buffer.put(
        LogEntry(
            timestamp=datetime.datetime.now().isoformat(),
            level="INFO",
            source="main_loop",
            message="System startup complete."
        )
    )
    await asyncio.sleep(5)
    await integrity_manager.log_buffer.put(
        LogEntry(
            timestamp=datetime.datetime.now().isoformat(),
            level="ERROR",
            source="database_connector",
            message="Connection timeout to primary database."
        )
    )

async def main() -> None:
    """
    Main entry point for the Jules AI System Integrity Monitor.

    This function initializes the IntegrityManager, parses command-line arguments,
    and runs the main monitoring loop. It includes error handling and options for
    manual integrity checks and log simulation.
    """
    parser = argparse.ArgumentParser(description="Jules AI System Integrity Monitor")
    parser.add_argument(
        "--check-integrity",
        action="store_true",
        help="Perform a manual system integrity check and exit."
    )
    parser.add_argument(
        "--simulate-logs",
        action="store_true",
        help="Run with a log simulator for demonstration purposes."
    )
    args, _ = parser.parse_known_args()

    try:
        integrity_manager = IntegrityManager()
    except Exception as e:
        logging.critical(f"Failed to initialize IntegrityManager: {e}", exc_info=True)
        sys.exit(1)

    monitor_task = asyncio.create_task(integrity_manager.monitor())

    if args.check_integrity:
        await integrity_manager.verify_system_state()
        monitor_task.cancel()
        return

    logging.info("Jules Integrity Monitor is running. Press Ctrl+C to stop.")

    if args.simulate_logs:
        logging.info("Running with log simulator.")
        simulator_task = asyncio.create_task(log_simulator(integrity_manager))
        await simulator_task
        await integrity_manager.log_buffer.join()
    else:
        # In a real application, logs would be fed into the buffer from other sources.
        # This loop keeps the service alive.
        while not monitor_task.done():
            await asyncio.sleep(1)

    monitor_task.cancel()
    try:
        await monitor_task
    except asyncio.CancelledError:
        logging.info("Integrity monitor shut down gracefully.")

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logging.info("Shutting down Jules.")
    except Exception as e:
        logging.critical(f"An unhandled exception occurred: {e}", exc_info=True)
