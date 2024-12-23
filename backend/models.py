# models.py

from pydantic import BaseModel
from typing import Optional

class SatellitePosition(BaseModel):
    name: str
    norad_id: Optional[int] = None
    type: Optional[str] = None
    mission_description: Optional[str] = None
    latitude: float
    longitude: float
    altitude_km: float
