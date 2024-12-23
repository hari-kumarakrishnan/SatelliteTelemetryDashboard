# combined_app.py

from fastapi import FastAPI, WebSocket
from pydantic import BaseModel
import uvicorn
import uuid
import random
import asyncio
from typing import List
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],  # Angular app's origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1) Telemetry in-memory store
telemetry_data: List[dict] = []

# Background telemetry generator
async def generate_telemetry():
    while True:
        new_data = {
            "satellite_id": 1,
            "timestamp": str(asyncio.get_event_loop().time()),
            "power_usage": random.uniform(0, 100),
            "orbit_x": random.uniform(0, 1000),
            "orbit_y": random.uniform(0, 1000),
            "temperature": random.uniform(-100, 120)
        }
        telemetry_data.append(new_data)
        await asyncio.sleep(1)  # generate every second

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(generate_telemetry())

@app.get("/")
def root():
    return {"message": "Combined service is running"}

@app.get("/telemetry")
def get_telemetry():
    return telemetry_data[-10:]

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            if telemetry_data:
                await websocket.send_json(telemetry_data[-1])
            await asyncio.sleep(1)
    except:
        await websocket.close()

# 2) Command feature
class SatelliteCommand(BaseModel):
    satellite_id: int
    command_name: str
    payload: dict = {}

command_responses = {}

@app.post("/commands")
async def send_command(cmd: SatelliteCommand):
    command_id = str(uuid.uuid4())
    asyncio.create_task(simulate_command_ack(command_id))
    command_responses[command_id] = "PENDING"
    return {"status": "Command sent", "command_id": command_id}

@app.get("/commands/{command_id}")
def get_command_status(command_id: str):
    status = command_responses.get(command_id, "NOT_FOUND")
    return {"command_id": command_id, "status": status}

async def simulate_command_ack(command_id: str):
    await asyncio.sleep(random.uniform(1, 3))
    command_responses[command_id] = "ACKNOWLEDGED"

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
