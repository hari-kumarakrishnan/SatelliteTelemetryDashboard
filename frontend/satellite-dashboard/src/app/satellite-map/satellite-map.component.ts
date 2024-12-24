import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  Input,
  AfterViewInit,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import * as d3 from 'd3';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

import { SatelliteService } from '../services/satellite.service';
import { SatellitePosition, OrbitPoint } from '../models/satellite-position.model';

@Component({
  selector: 'app-satellite-map',
  templateUrl: './satellite-map.component.html',
  styleUrls: ['./satellite-map.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class SatelliteMapComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @Input() filters: any = {};
  @ViewChild('chart', { static: true }) private chartContainer!: ElementRef;

  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | undefined;
  private width = 960;
  private height = 600;
  private path!: d3.GeoPath<unknown, d3.GeoPermissibleObjects>;
  private projection: d3.GeoProjection | undefined;
  private g: d3.Selection<SVGGElement, unknown, null, undefined> | undefined;
  satellites: SatellitePosition[] = [];
  isLoading = false;
  isError = false;
  errorMessage = '';
  currentPage = 1;
  pageSize = 25;
  private subscription!: Subscription;

  constructor(private satelliteService: SatelliteService) {}

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.createSvg();
    this.drawMap();
    this.fetchAndDisplaySatellites();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filters'] && !changes['filters'].isFirstChange()) {
      this.currentPage = 1;
      this.fetchAndDisplaySatellites();
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }


  private createSvg(): void {
    if (!this.chartContainer) {
      console.error('Chart container is undefined');
      return;
    }

    this.svg = d3
      .select(this.chartContainer.nativeElement)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .style('background-color', '#eef');

    this.projection = d3.geoMercator()
      .scale(150)
      .translate([this.width / 2, this.height / 1.5]);

    this.path = d3.geoPath<unknown, d3.GeoPermissibleObjects>()
      .projection(this.projection);

    this.g = this.svg.append('g');

    this.svg.call(
      d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([1, 8])
        .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
          this.g?.attr('transform', event.transform.toString());
        })
    );
  }

  private drawMap(): void {
    d3.json<GeoJSON.FeatureCollection<GeoJSON.Geometry>>(
      'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson'
    )
      .then((data) => {
        if (!data) {
          console.error('No GeoJSON data loaded.');
          return;
        }

        if (!this.g || !this.path) return;
        this.g
          .selectAll('path')
          .data(data.features)
          .enter()
          .append('path')
          .attr('d', (feature) => {
            return this.path(feature) ?? '';
          })
          .attr('fill', '#b8b8b8')
          .attr('stroke', '#fff');
      })
      .catch((error: any) => {
        console.error('Error loading map data:', error);
      });
  }
  private fetchAndDisplaySatellites(): void {
    this.isLoading = true;
    this.isError = false;
    this.errorMessage = '';

    this.subscription = this.satelliteService
      .getSatellites(this.filters, this.currentPage, this.pageSize)
      .subscribe(
        (data: SatellitePosition[]) => {
          console.log('Satellites fetched:', data);
          this.satellites = data;
          this.updateSatellites(data);
          this.isLoading = false;
        },
        (error: any) => {
          console.error('Error fetching satellites:', error);
          this.isError = true;
          this.errorMessage = 'Failed to load satellites. Please try again later.';
          this.isLoading = false;
        }
      );
  }

  private updateSatellites(satellites: SatellitePosition[]): void {
    if (!this.g || !this.projection) {
      console.error('Map not ready or projection is undefined');
      return;
    }
    this.g.selectAll('.satellite').remove();
    this.g.selectAll('.orbit-path').remove();
    this.g
      .selectAll('.satellite')
      .data(satellites)
      .enter()
      .append('circle')
      .attr('class', 'satellite')
      .attr('cx', (d: SatellitePosition) => {
        const coords = this.projection!([d.longitude, d.latitude]);
        return coords ? coords[0] : 0;
      })
      .attr('cy', (d: SatellitePosition) => {
        const coords = this.projection!([d.longitude, d.latitude]);
        return coords ? coords[1] : 0;
      })
      .attr('r', 5)
      .attr('fill', 'red')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .append('title')
      .text(
        (d: SatellitePosition) =>
          `Name: ${d.name}\nNORAD: ${d.norad_id}\nType: ${d.type || 'N/A'}\nMission: ${
            d.mission_description || 'N/A'
          }\nLat: ${d.latitude.toFixed(2)}\nLon: ${d.longitude.toFixed(2)}\nAlt: ${d.altitude_km} km`
      );

    satellites.forEach((sat) => {
      if (sat.norad_id) {
        this.satelliteService
          .getSatelliteOrbit(sat.norad_id, 2, 10) 
          .subscribe(
            (orbitData: OrbitPoint[]) => {
              this.drawOrbitPath(orbitData, sat.norad_id!);
            },
            (err: any) => {
              console.error('Error fetching orbit data for NORAD:', sat.norad_id, err);
            }
          );
      }
    });
  }

  private drawOrbitPath(orbitData: OrbitPoint[], noradId: number): void {
    if (!this.g || !this.projection) return;
      const orbitCoords = orbitData.map((point) => {
      const coords = this.projection!([point.longitude, point.latitude]);
      return coords ? coords : [0, 0];
    });
  
    const lineGenerator = d3.line<[number, number]>()
      .x((d) => d[0])
      .y((d) => d[1])
      .curve(d3.curveBasis); 
    const pathSelection = this.g
      .append('path')
      .datum(orbitCoords)
      .attr('class', `orbit-path orbit-${noradId}`)
      .attr('fill', 'none')
      .attr('stroke', 'orange')
      .attr('stroke-width', 2)
      .attr('d', lineGenerator as any);
  
    const marker = this.g
      .append('circle')
      .attr('class', `orbit-marker orbit-${noradId}`)
      .attr('r', 5)
      .attr('fill', 'red');
  
    const totalLength = (pathSelection.node() as SVGPathElement).getTotalLength();
    marker
      .transition()
      .duration(30000) 
      .ease(d3.easeLinear)
      .attrTween('transform', function () {
        return function (t: number) {
          const point = (pathSelection.node() as SVGPathElement)
            .getPointAtLength(t * totalLength);
          return `translate(${point.x}, ${point.y})`;
        };
      });
  }
  
  nextPage(): void {
    this.currentPage += 1;
    this.fetchAndDisplaySatellites();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage -= 1;
      this.fetchAndDisplaySatellites();
    }
  }
}