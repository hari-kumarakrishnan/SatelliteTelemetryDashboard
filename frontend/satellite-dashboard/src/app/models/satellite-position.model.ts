export interface SatellitePosition {
    name: string;
    norad_id?: number;
    type?: string;
    mission_description?: string;
    latitude: number;
    longitude: number;
    altitude_km: number;
}