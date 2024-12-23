from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Query
from typing import List, Optional
import uvicorn
import requests
from skyfield.api import EarthSatellite, load
import asyncio
from fastapi.middleware.cors import CORSMiddleware
import logging
from datetime import datetime

# Import the SatellitePosition model
from models import SatellitePosition

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],  # Adjust this to match your Angular app's URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory cache for TLE data
class TLECache:
    def __init__(self):
        self.satellites: List[SatellitePosition] = []
        self.last_updated: Optional[datetime] = None

    async def update_cache(self):
        logger.info("Starting TLE data fetch and cache update.")
        tle_api_url = "https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle"
        headers = {
            "User-Agent": "SatelliteDashboard/1.0 (your_email@example.com)"  # Replace with your info
        }
        try:
            response = requests.get(tle_api_url, headers=headers, timeout=10)  # Set a timeout for the request
            response.raise_for_status()  
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching TLE data: {e}")
            return  # Do not update the cache on failure

        tle_text = response.text
        lines = tle_text.strip().split('\n')
        satellites = []
        
        ts = load.timescale()
        t = ts.now()

        for i in range(0, len(lines), 3):
            if i + 2 >= len(lines):
                break
            name = lines[i].strip()
            tle1 = lines[i+1].strip()
            tle2 = lines[i+2].strip()

            try:
                satellite = EarthSatellite(tle1, tle2, name, ts)
                geocentric = satellite.at(t)
                subpoint = geocentric.subpoint()
                norad_id = satellite.model.satnum  # Extracting NORAD ID directly

                satellites.append(SatellitePosition(
                    name=name,
                    norad_id=norad_id,
                    latitude=subpoint.latitude.degrees,
                    longitude=subpoint.longitude.degrees,
                    altitude_km=subpoint.elevation.km
                ))
            except Exception as e:
                logger.warning(f"Error processing satellite {name}: {e}")
                continue

        self.satellites = satellites  # Cache all satellites
        self.last_updated = datetime.utcnow()
        logger.info(f"Cache updated with {len(self.satellites)} satellites at {self.last_updated} UTC.")

# Initialize cache
tle_cache = TLECache()

# Background task to periodically update the cache
async def periodic_cache_update():
    while True:
        await tle_cache.update_cache()
        await asyncio.sleep(7200)  # Sleep for 2 hours (7200 seconds)

@app.on_event("startup")
async def startup_event():
    # Initial cache update
    await tle_cache.update_cache()
        # Start the background task
    asyncio.create_task(periodic_cache_update())
    logger.info("Startup event completed.")


@app.get("/", response_model=dict)
def root():
    return {"message": "Satellite Position API is running."}

@app.get("/satellites", response_model=List[SatellitePosition])
def get_filtered_satellites(
    name: Optional[str] = Query(None, description="Filter by satellite name"),
    norad_id: Optional[int] = Query(None, description="Filter by NORAD ID"),
    type: Optional[str] = Query(None, description="Filter by satellite type"),
    mission: Optional[str] = Query(None, description="Filter by mission description"),
    min_altitude: Optional[float] = Query(None, description="Minimum altitude in km"),
    max_altitude: Optional[float] = Query(None, description="Maximum altitude in km"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(100, ge=1, le=1000, description="Number of satellites per page")
):
    """
    Fetch and filter satellite positions based on query parameters with pagination.
    """
    filtered_satellites = tle_cache.satellites

    if name:
        filtered_satellites = [sat for sat in filtered_satellites if name.lower() in sat.name.lower()]
    
    if norad_id:
        filtered_satellites = [sat for sat in filtered_satellites if sat.norad_id == norad_id]
    
    if type:
        filtered_satellites = [sat for sat in filtered_satellites if sat.type and type.lower() in sat.type.lower()]
    
    if mission:
        filtered_satellites = [sat for sat in filtered_satellites if sat.mission_description and mission.lower() in sat.mission_description.lower()]
    
    if min_altitude is not None:
        filtered_satellites = [sat for sat in filtered_satellites if sat.altitude_km >= min_altitude]
    
    if max_altitude is not None:
        filtered_satellites = [sat for sat in filtered_satellites if sat.altitude_km <= max_altitude]
    
    start = (page - 1) * page_size
    end = start + page_size
    paginated_satellites = filtered_satellites[start:end]
    
    return paginated_satellites

@app.websocket("/ws/satellite_positions")
async def websocket_satellite_positions(websocket: WebSocket):
    await websocket.accept()
    logger.info("WebSocket connection accepted")
    try:
        while True:
            if tle_cache.satellites:
                await websocket.send_json([sat.dict() for sat in tle_cache.satellites])
                logger.info(f"Sent {len(tle_cache.satellites)} satellites to client.")
            else:
                await websocket.send_json({"error": "Failed to fetch TLE data."})
                logger.warning("Failed to fetch TLE data.")
            await asyncio.sleep(60)  # Send data every 60 seconds
    except WebSocketDisconnect:
        logger.info("Client disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await websocket.close()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
