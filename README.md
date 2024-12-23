# Satellite Dashboard

A web-based application for visualizing and searching satellite telemetry data. This project provides an interactive map to display satellite positions and a search feature to filter satellites based on various criteria.

---

## Features

- **Interactive Map**: Visualize satellite positions using a world map.
- **Satellite Search**: Search and filter satellites based on name, NORAD ID, type, mission, and altitude range.
- **Real-time Updates**: Fetch live satellite data from a backend service.
- **Pagination**: Navigate through large datasets efficiently.
- **Responsive Design**: Optimized for various screen sizes.

---

## Technologies Used

### Frontend
- **Angular**: Framework for building the interactive UI.
- **D3.js**: Library for creating dynamic and interactive data visualizations.
- **RxJS**: Reactive programming library for handling data streams.
- **Bootstrap**: For UI styling and layout.

### Backend
- **FastAPI**: Python framework for building the REST API.
- **Skyfield**: Library for satellite position calculations using TLE data.
- **Uvicorn**: ASGI server to run the backend.

---

## Getting Started

### Prerequisites

- **Node.js** (v14+)
- **Angular CLI** (v15+)
- **Python** (v3.9+)
- **pip** (Python package installer)
