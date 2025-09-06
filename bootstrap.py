#!/usr/bin/env python3
import subprocess
import sys
import os
import signal
from pathlib import Path
from datetime import datetime
import time

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
    print(f"[{datetime.now().isoformat()}] {msg}")


def run(cmd: str, cwd: Path | None = None, ignore_errors: bool = False, retries: int = 0) -> bool:
    """Run a shell command. Returns success status."""
    global shutdown_requested
    
    cwd_display = cwd or Path.cwd()
    log(f"Running: {cmd} in {cwd_display}")
    
    for attempt in range(retries + 1):
        if shutdown_requested:
            log("Shutdown requested, aborting command")
            return False
            
        try:
            subprocess.run(cmd, cwd=cwd, shell=True, check=True)
            return True
        except subprocess.CalledProcessError as e:
            if shutdown_requested:
                log("Shutdown requested, aborting retries")
                return False
                
            if attempt < retries:
                log(f"Retrying ({attempt + 1}/{retries + 1}) in 2 seconds...")
                for _ in range(20):  # Sleep in 0.1s increments to check shutdown
                    if shutdown_requested:
                        log("Shutdown requested, aborting retry wait")
                        return False
                    time.sleep(0.1)
                continue
            
            if ignore_errors:
                log(f"[WARN] Command failed but continuing: exit code {e.returncode}")
                return False
            else:
                log(f"[ERROR] Command failed with exit code {e.returncode}")
                raise


def check_command_exists(cmd: str) -> bool:
    try:
        # Use 'where' on Windows, 'which' on Unix-like systems
        check_cmd = "where" if os.name == "nt" else "which"
        subprocess.run(f"{check_cmd} {cmd}", shell=True, check=True, capture_output=True)
        return True
    except subprocess.CalledProcessError:
        return False


def validate_tools() -> bool:
    """Validate required tools are available."""
    log("Validating required tools...")
    
    tools = {
        "node": check_command_exists("node"),
        "yarn": check_command_exists("yarn"),
        "cargo": check_command_exists("cargo")
    }
    
    for tool, available in tools.items():
        symbol = "✓" if available else "✗"
        log(f"{symbol} {tool}")
    
    if not tools["yarn"]:
        log("[ERROR] yarn is required. Please install yarn:")
        log("  npm install -g yarn")
        log("  or visit: https://yarnpkg.com/getting-started/install")
        return False
    
    if not all(tools.values()):
        log("[ERROR] Missing required tools")
        return False
    
    log("All required tools available!")
    return True


def setup_project(name: str, path: Path, project_type: str) -> bool:
    """Set up a project based on its type."""
    if not path.exists():
        log(f"[ERROR] Directory {path} does not exist")
        return False
    
    config_file = "package.json" if project_type == "node" else "Cargo.toml"
    if not (path / config_file).exists():
        log(f"[ERROR] No {config_file} found in {path}")
        return False
    
    log(f"Setting up {name}...")
    
    try:
        if project_type == "node":
            run("yarn install", cwd=path, retries=1)
        else:  # rust
            run("cargo fetch", cwd=path, retries=1)
        
        log(f"✓ {name} setup complete")
        return True
    except subprocess.CalledProcessError:
        log(f"✗ {name} setup failed")
        return False


def main() -> None:
    # Register signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    if os.name == "nt" and hasattr(signal, 'SIGBREAK'):
        signal.signal(signal.SIGBREAK, signal_handler)
    
    log("Starting bootstrap process...")
    
    if shutdown_requested or not validate_tools():
        sys.exit(1)
    
    projects = [
        ("Node.js Bot", Path("bot"), "node"),
        ("Node.js Frontend", Path("site/frontend"), "node"),
        ("Rust Backend", Path("site/backend"), "rust"),
    ]
    
    results = []
    for name, path, ptype in projects:
        if shutdown_requested:
            log("Shutdown requested, stopping bootstrap")
            sys.exit(130) # SIGINT exit code
        results.append(setup_project(name, path, ptype))
    
    success_count = sum(results)
    
    if shutdown_requested:
        log("Bootstrap interrupted")
        sys.exit(130)
    elif success_count == len(projects):
        log("Bootstrap completed successfully!")
    else:
        log(f"Bootstrap completed with errors ({success_count}/{len(projects)} successful)")
        sys.exit(1)


if __name__ == "__main__":
    main()
