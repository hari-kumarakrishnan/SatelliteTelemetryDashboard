import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Input, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import * as d3 from 'd3';
import { SatelliteService } from '../services/satellite.service';
import { SatellitePosition } from '../models/satellite-position.model';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-satellite-map',
  templateUrl: './satellite-map.component.html',
  styleUrls: ['./satellite-map.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class SatelliteMapComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @Input() filters: any = {}; // Receives filters from AppComponent
  @ViewChild('chart', { static: true }) private chartContainer!: ElementRef;

  private svg: any;
  private width = 960;
  private height = 600;
  private projection: any;
  private path: any;
  private g: any;
  private subscription!: Subscription;

  satellites: SatellitePosition[] = [];
  isLoading: boolean = false;
  isError: boolean = false;
  errorMessage: string = '';

  // Pagination
  currentPage: number = 1;
  pageSize: number = 100;

  constructor(private satelliteService: SatelliteService) {}

  ngOnInit(): void {
    // Initialization logic, if any
  }

  ngAfterViewInit(): void {
    this.createSvg();
    this.drawMap();
    this.fetchAndDisplaySatellites(); // Fetch satellites after the map is drawn
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filters'] && !changes['filters'].isFirstChange()) {
      this.currentPage = 1; // Reset to first page when filters change
      this.fetchAndDisplaySatellites();
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  /**
   * Initializes the SVG canvas and D3 projection.
   */
  private createSvg(): void {
    if (!this.chartContainer) {
      console.error('Chart container is undefined');
      return;
    }

    this.svg = d3.select(this.chartContainer.nativeElement)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .style('background-color', '#eef');

    this.projection = d3.geoMercator()
      .scale(150)
      .translate([this.width / 2, this.height / 1.5]);

    this.path = d3.geoPath().projection(this.projection);

    this.g = this.svg.append('g');

    // Add zoom and pan functionality
    this.svg.call(
      d3.zoom()
        .scaleExtent([1, 8])
        .on('zoom', (event: any) => {
          this.g.attr('transform', event.transform);
        })
    );
  }

  /**
   * Draws the world map using GeoJSON data.
   */
  private drawMap(): void {
    d3.json('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson')
      .then((data: any) => {
        this.g
          .selectAll('path')
          .data(data.features)
          .enter()
          .append('path')
          .attr('d', this.path)
          .attr('fill', '#b8b8b8')
          .attr('stroke', '#fff');
      })
      .catch((error) => {
        console.error('Error loading map data:', error);
      });
  }

  /**
   * Fetches satellite data based on current filters and updates the map.
   */
  private fetchAndDisplaySatellites(): void {
    this.isLoading = true;
    this.isError = false;

    this.satelliteService.getSatellites(this.filters, this.currentPage, this.pageSize).subscribe(
      (data: SatellitePosition[]) => {
        console.log('Satellites fetched:', data);
        this.satellites = data;
        this.updateSatellites(this.satellites);
        this.isLoading = false;
      },
      (error: any) => {
        console.error('Error fetching satellites:', error);
        this.isLoading = false;
        this.isError = true;
        this.errorMessage = 'Failed to load satellites. Please try again later.';
      }
    );
  }

  /**
   * Updates the satellite markers on the map.
   */
  private updateSatellites(satellites: SatellitePosition[]): void {
    if (!satellites) {
      console.error('Satellites data is undefined');
      return;
    }

    // Remove existing satellites
    this.g.selectAll('.satellite').remove();

    // Add satellites
    this.g
      .selectAll('.satellite')
      .data(satellites)
      .enter()
      .append('circle')
      .attr('class', 'satellite')
      .attr('cx', (d: SatellitePosition) => {
        const coords = this.projection([d.longitude, d.latitude]);
        return coords ? coords[0] : null;
      })
      .attr('cy', (d: SatellitePosition) => {
        const coords = this.projection([d.longitude, d.latitude]);
        return coords ? coords[1] : null;
      })
      .attr('r', 5)
      .attr('fill', 'red')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .append('title') // Tooltip
      .text(
        (d: SatellitePosition) =>
          `Name: ${d.name}\nNORAD ID: ${d.norad_id}\nType: ${d.type || 'N/A'}\nMission: ${
            d.mission_description || 'N/A'
          }\nLatitude: ${d.latitude.toFixed(2)}°\nLongitude: ${d.longitude.toFixed(2)}°\nAltitude: ${d.altitude_km} km`
      );
  }

  /**
   * Navigates to the next page of satellite data.
   */
  nextPage(): void {
    this.currentPage += 1;
    this.fetchAndDisplaySatellites();
  }

  /**
   * Navigates to the previous page of satellite data.
   */
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage -= 1;
      this.fetchAndDisplaySatellites();
    }
  }
}
