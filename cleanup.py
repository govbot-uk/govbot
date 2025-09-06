#!/usr/bin/env python3
import shutil
import sys
import signal
import os
import argparse
from pathlib import Path

# Global flag for shutdown
shutdown_requested = False

def signal_handler(signum, frame):
    """Handle shutdown signals gracefully."""
    global shutdown_requested
    signal_names = {signal.SIGINT: "SIGINT", signal.SIGTERM: "SIGTERM"}
    if os.name == "nt" and hasattr(signal, 'SIGBREAK'):
        signal_names[signal.SIGBREAK] = "SIGBREAK"
    
    signal_name = signal_names.get(signum, f"Signal {signum}")
    log(f"Received {signal_name}, shutting down gracefully...")
    shutdown_requested = True

def log(msg: str) -> None:
    """Log an info message."""
    print(f"[INFO] {msg}")


def log_error(msg: str) -> None:
    """Log an error message to stderr."""
    print(f"[ERROR] {msg}", file=sys.stderr)


def remove_path(path: Path, dry_run: bool = False) -> bool:
    """Remove a file or directory."""
    if not path.exists():
        return True

    try:
        action = "Would remove" if dry_run else "Removing"
        path_type = "directory" if path.is_dir() else "file"
        log(f"{action} {path_type}: {path}")

        if not dry_run:
            shutil.rmtree(path) if path.is_dir() else path.unlink()
        return True
    except (PermissionError, Exception) as e:
        log_error(f"Failed to remove {path}: {e}")
        return False


def cleanup_project(path: Path, patterns: dict, dry_run: bool = False) -> bool:
    """Clean up a project using given patterns."""
    global shutdown_requested
    
    if shutdown_requested:
        log("Shutdown requested, skipping cleanup")
        return False
        
    if not path.exists():
        log(f"Project directory {path} does not exist, skipping")
        return True

    log(f"Cleaning up project: {path}")

    success = True
    for pattern_type, items in patterns.items():
        if shutdown_requested:
            log("Shutdown requested, stopping cleanup")
            return False
            
        for item in items:
            if shutdown_requested:
                log("Shutdown requested, stopping cleanup")
                return False
                
            if "*" in item:  # glob pattern
                for found in path.rglob(item):
                    if shutdown_requested:
                        log("Shutdown requested, stopping cleanup")
                        return False
                    success &= remove_path(found, dry_run)
            else:  # direct path
                success &= remove_path(path / item, dry_run)

    return success


def main() -> None:
    """Main cleanup function."""
    # Register signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    if os.name == "nt" and hasattr(signal, 'SIGBREAK'):
        signal.signal(signal.SIGBREAK, signal_handler)
    
    parser = argparse.ArgumentParser(description="Clean up project artifacts")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be removed",
    )
    args = parser.parse_args()

    if args.dry_run:
        log("DRY RUN MODE - No files will be removed")

    # Define cleanup patterns
    node_patterns = {
        "deps": ["node_modules"],
        "locks": ["package-lock.json", "pnpm-lock.yaml"],
        "builds": [".next", "dist", "build", ".output"],
        "cache": [".cache", "node_modules/.cache"],
    }

    rust_patterns = {"builds": ["target"]}

    # Define projects
    projects = [
        ("Node.js Bot", Path("bot"), node_patterns),
        ("Node.js Frontend", Path("site/frontend"), node_patterns),
        ("Rust Backend", Path("site/backend"), rust_patterns),
    ]

    # Process projects
    results = []
    for name, path, patterns in projects:
        if shutdown_requested:
            log("Cleanup interrupted")
            sys.exit(130)  # SIGINT exit code
        results.append(cleanup_project(path, patterns, args.dry_run))
    
    success_count = sum(results)

    if shutdown_requested:
        log("Cleanup interrupted")
        sys.exit(130)
    elif success_count == len(projects):
        log("Cleanup completed successfully!")
    else:
        log_error(
            f"Cleanup completed with errors ({success_count}/{len(projects)} successful)"
        )
        sys.exit(1)


if __name__ == "__main__":
    main()
