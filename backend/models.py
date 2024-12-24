from pydantic import BaseModel

class SatellitePosition(BaseModel):
    name: str
    norad_id: int | None = None
    type: str | None = None
    mission_description: str | None = None
    latitude: float
    longitude: float
    altitude_km: float

class OrbitPoint(BaseModel):
    timestamp: str  # ISO format
    latitude: float
    longitude: float
    altitude_km: float
