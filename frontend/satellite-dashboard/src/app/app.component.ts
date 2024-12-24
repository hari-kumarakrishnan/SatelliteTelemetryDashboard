import { Component } from '@angular/core';
import { SatelliteSearchComponent } from './satellite-search/satellite-search.component';
import { SatelliteMapComponent } from './satellite-map/satellite-map.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [SatelliteSearchComponent, SatelliteMapComponent]
})
export class AppComponent {
  title = 'Satellite Dashboard';
  currentFilters: any = {};  
  onFiltersApplied(filters: any): void {
    this.currentFilters = filters;
    console.log('Filters applied:', this.currentFilters);
  }
}
