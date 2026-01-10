#!/usr/bin/env python3
"""
DFO Sync Agent - Local Memory Synchronization
Syncs observations from claude-mem (SQLite) to DFO Server (central)

Author: ECO-Lambda | SOLARIA Memory System
Date: 2026-01-06
Task: MEM-004
"""

import os
import sys
import time
import json
import sqlite3
import requests
import argparse
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any


# Configuration
DFO_SERVER_URL = os.environ.get("DFO_SERVER_URL", "https://dfo.solaria.agency/mcp")
DFO_API_URL = os.environ.get("DFO_API_URL", "https://dfo.solaria.agency/api")
DFO_USERNAME = os.environ.get("DFO_USERNAME", "carlosjperez")
DFO_PASSWORD = os.environ.get("DFO_PASSWORD", "bypass")

# Local claude-mem paths
CLAUDE_MEM_DIR = os.path.expanduser("~/.claude-mem")
CLAUDE_MEM_DB = os.path.join(CLAUDE_MEM_DIR, "claude-mem.db")


class DFOSyncAgent:
    """Synchronization agent for claude-mem to DFO Server"""

    def __init__(
        self, machine_id: Optional[str] = None, machine_name: Optional[str] = None
    ):
        self.machine_id = machine_id or self._get_or_create_machine_id()
        self.machine_name = machine_name or self._get_machine_name()
        self.token = None
        self.session = requests.Session()
        self.last_sync_time: Optional[datetime] = None

    def _get_or_create_machine_id(self) -> str:
        """Get existing machine ID or create new one"""
        id_file = os.path.join(CLAUDE_MEM_DIR, ".machine_id")

        if os.path.exists(id_file):
            with open(id_file, "r") as f:
                return f.read().strip()

        # Generate new machine ID
        import uuid

        machine_id = str(uuid.uuid4())

        with open(id_file, "w") as f:
            f.write(machine_id)

        return machine_id

    def _get_machine_name(self) -> str:
        """Get human-readable machine name"""
        import socket

        hostname = socket.gethostname()

        import platform

        system = platform.system()
        machine_name = f"{system} - {hostname}"

        return machine_name

    def authenticate(self) -> bool:
        """Authenticate with DFO server"""
        try:
            response = self.session.post(
                f"{DFO_API_URL}/auth/login",
                json={"username": DFO_USERNAME, "password": DFO_PASSWORD},
                timeout=10,
            )

            if response.status_code == 200:
                data = response.json()
                self.token = data.get("token")
                self.session.headers.update({"Authorization": f"Bearer {self.token}"})
                return True

            print(f"❌ Auth failed: {response.status_code}")
            return False

        except Exception as e:
            print(f"❌ Auth error: {e}")
            return False

    def get_last_sync_time(self) -> Optional[datetime]:
        """Get last successful sync time from sync_metadata table"""
        try:
            conn = sqlite3.connect(CLAUDE_MEM_DB)
            cursor = conn.cursor()

            cursor.execute("""
                SELECT last_synced_at
                FROM sync_metadata
                ORDER BY created_at DESC
                LIMIT 1
            """)

            row = cursor.fetchone()
            conn.close()

            if row:
                last_sync_str = row[0]
                if last_sync_str:
                    return datetime.fromisoformat(last_sync_str)

            return None

        except Exception as e:
            print(f"⚠️ Could not get last sync time: {e}")
            return None

    def get_pending_observations(self, since: Optional[datetime] = None) -> List[Dict]:
        """Get observations that need to be synced"""
        try:
            conn = sqlite3.connect(CLAUDE_MEM_DB)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()

            query = """
                SELECT 
                    id as local_observation_id,
                    session_id,
                    tool_name,
                    tool_input,
                    tool_response,
                    metadata,
                    created_at
                FROM observations
            """

            params = []

            if since:
                query += " WHERE created_at > ?"
                params.append(since.isoformat())

            query += " ORDER BY created_at ASC LIMIT 1000"

            cursor.execute(query, params)
            rows = cursor.fetchall()
            conn.close()

            return [dict(row) for row in rows]

        except Exception as e:
            print(f"❌ Error getting observations: {e}")
            return []

    def get_pending_summaries(self, since: Optional[datetime] = None) -> List[Dict]:
        """Get summaries that need to be synced"""
        try:
            conn = sqlite3.connect(CLAUDE_MEM_DB)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()

            query = """
                SELECT 
                    session_id,
                    summary,
                    key_points,
                    tags,
                    observations_count,
                    created_at
                FROM summaries
            """

            params = []

            if since:
                query += " WHERE created_at > ?"
                params.append(since.isoformat())

            query += " ORDER BY created_at ASC LIMIT 100"

            cursor.execute(query, params)
            rows = cursor.fetchall()
            conn.close()

            return [dict(row) for row in rows]

        except Exception as e:
            print(f"❌ Error getting summaries: {e}")
            return []

    def sync_to_dfo(self, observations: List[Dict], summaries: List[Dict]) -> bool:
        """Sync observations and summaries to DFO server"""
        start_time = time.time()

        try:
            if not observations and not summaries:
                print("✅ Nothing to sync")
                return True

            payload = {
                "jsonrpc": "2.0",
                "id": 1,
                "method": "tools/call",
                "params": {
                    "name": "memory_sync_remote",
                    "arguments": {
                        "observations": observations,
                        "summaries": summaries if summaries else None,
                        "machine_id": self.machine_id,
                        "machine_name": self.machine_name,
                    },
                },
            }

            response = self.session.post(DFO_SERVER_URL, json=payload, timeout=120)

            duration_ms = int((time.time() - start_time) * 1000)

            if response.status_code == 200:
                data = response.json()
                result = data.get("result", {})
                content = result.get("content", [])

                if content:
                    text = content[0].get("text", "")
                    if "error" in text.lower():
                        print(f"❌ Sync failed: {text}")
                        return False

                print(f"✅ Sync completed in {duration_ms}ms")
                print(f"   - Observations synced: {len(observations)}")
                print(f"   - Summaries synced: {len(summaries)}")

                self._update_last_sync_time()
                return True

            print(f"❌ Sync HTTP error: {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            return False

        except Exception as e:
            print(f"❌ Sync error: {e}")
            return False

    def _update_last_sync_time(self):
        """Update last sync time in sync_metadata table"""
        try:
            conn = sqlite3.connect(CLAUDE_MEM_DB)
            cursor = conn.cursor()

            cursor.execute(
                """
                UPDATE sync_metadata
                SET last_synced_at = ?
                WHERE id = (SELECT id FROM sync_metadata ORDER BY created_at DESC LIMIT 1)
            """,
                (datetime.now().isoformat(),),
            )

            conn.commit()
            conn.close()

        except Exception as e:
            print(f"⚠️ Could not update last sync time: {e}")

    def run_sync(self, force: bool = False) -> bool:
        """Run sync operation"""
        print(f"🔄 Starting sync: {self.machine_name} ({self.machine_id})")
        print(f"   DFO Server: {DFO_SERVER_URL}")
        print()

        # Authenticate
        if not self.authenticate():
            return False

        # Get last sync time
        if not force:
            self.last_sync_time = self.get_last_sync_time()
            if self.last_sync_time:
                time_ago = datetime.now() - self.last_sync_time
                print(f"   Last sync: {self.last_sync_time}")
                print(f"   Time ago: {time_ago}")
                print()
            else:
                print("   Last sync: Never (first sync)")
                print()
        else:
            print("   Force mode: syncing all data")
            print()

        # Get pending data
        observations = self.get_pending_observations(
            self.last_sync_time if not force else None
        )
        summaries = self.get_pending_summaries(
            self.last_sync_time if not force else None
        )

        print(f"📊 Pending sync:")
        print(f"   - Observations: {len(observations)}")
        print(f"   - Summaries: {len(summaries)}")
        print()

        if not observations and not summaries:
            print("✅ Everything is up to date")
            return True

        # Sync to DFO
        success = self.sync_to_dfo(observations, summaries)

        print()
        return success


def main():
    parser = argparse.ArgumentParser(
        description="DFO Sync Agent - Sync claude-mem to DFO Server",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s                      # Auto-sync (only if changes detected)
  %(prog)s --force             # Force full sync
  %(prog)s --interval 3600      # Run as daemon (sync every 1 hour)
  %(prog)s --once               # Single sync and exit
        """,
    )

    parser.add_argument(
        "--force", action="store_true", help="Force full sync (ignore last sync time)"
    )

    parser.add_argument(
        "--interval",
        type=int,
        default=3600,
        help="Sync interval in seconds (default: 3600 = 1 hour)",
    )

    parser.add_argument("--once", action="store_true", help="Run single sync and exit")

    parser.add_argument("--verbose", action="store_true", help="Enable verbose output")

    args = parser.parse_args()

    # Create sync agent
    agent = DFOSyncAgent()

    # Run sync
    if args.once:
        success = agent.run_sync(force=args.force)
        sys.exit(0 if success else 1)

    # Run as daemon
    if args.interval > 0:
        print(f"🚀 Starting daemon mode (sync every {args.interval}s)")
        print("   Press Ctrl+C to stop")
        print()

        while True:
            try:
                success = agent.run_sync(force=args.force)

                if success:
                    print(f"💤 Sleeping for {args.interval}s...")
                else:
                    print(f"⚠️ Sync failed, retrying in {args.interval}s...")

                time.sleep(args.interval)

            except KeyboardInterrupt:
                print("\n\n🛑 Stopping daemon")
                sys.exit(0)

            except Exception as e:
                print(f"❌ Unexpected error: {e}")
                print(f"   Retrying in 60s...")
                time.sleep(60)


if __name__ == "__main__":
    main()
