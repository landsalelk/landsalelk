import asyncio
import argparse
import datetime
from src.core.modules.integrity.integrity_manager import IntegrityManager
from src.core.modules.integrity.schemas import LogEntry

async def main():
    """Main function to run the Jules agent with the Integrity Manager."""
    integrity_manager = IntegrityManager()

    # Start the background monitoring task
    monitor_task = asyncio.create_task(integrity_manager.monitor())

    parser = argparse.ArgumentParser(description="Jules AI Agent")
    parser.add_argument(
        "--check-integrity",
        action="store_true",
        help="Perform a manual system integrity check."
    )
    args, _ = parser.parse_known_args()

    if args.check_integrity:
        await integrity_manager.verify_system_state()
        monitor_task.cancel()
        return

    print("Jules is running with Integrity Monitor. Simulating log entries...")
    async def log_simulator():
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

    simulator_task = asyncio.create_task(log_simulator())
    await simulator_task
    await integrity_manager.log_buffer.join()

    monitor_task.cancel()
    try:
        await monitor_task
    except asyncio.CancelledError:
        print("Integrity monitor shut down gracefully.")

if __name__ == "__main__":
    try:
        # To run this script, use: python -m src.core.jules
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nShutting down Jules.")
