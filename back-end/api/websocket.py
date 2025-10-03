"""
WebSocket endpoints for real-time progress updates.
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List
import json
import asyncio

router = APIRouter(prefix="/api/ws", tags=["websocket"])


class ConnectionManager:
    """Manages WebSocket connections."""
    
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, task_id: str):
        """Accept a WebSocket connection for a specific task."""
        await websocket.accept()
        if task_id not in self.active_connections:
            self.active_connections[task_id] = []
        self.active_connections[task_id].append(websocket)

    def disconnect(self, websocket: WebSocket, task_id: str):
        """Remove a WebSocket connection."""
        if task_id in self.active_connections:
            self.active_connections[task_id].remove(websocket)
            if not self.active_connections[task_id]:
                del self.active_connections[task_id]

    async def send_progress_update(self, task_id: str, message: dict):
        """Send progress update to all connections for a task."""
        if task_id in self.active_connections:
            for connection in self.active_connections[task_id]:
                try:
                    await connection.send_text(json.dumps(message))
                except:
                    # Remove dead connections
                    self.active_connections[task_id].remove(connection)


manager = ConnectionManager()


@router.websocket("/progress/{task_id}")
async def websocket_progress(websocket: WebSocket, task_id: str):
    """WebSocket endpoint for real-time progress updates."""
    await manager.connect(websocket, task_id)
    
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, task_id)


async def broadcast_progress_update(task_id: str, update_data: dict):
    """Broadcast progress update to all connected clients for a task."""
    await manager.send_progress_update(task_id, update_data)


def broadcast_progress_update_sync(task_id: str, update_data: dict):
    """Synchronous version of broadcast progress update."""
    import asyncio
    try:
        loop = asyncio.get_event_loop()
        loop.run_until_complete(manager.send_progress_update(task_id, update_data))
    except RuntimeError:
        # If no event loop is running, create a new one
        asyncio.run(manager.send_progress_update(task_id, update_data))
