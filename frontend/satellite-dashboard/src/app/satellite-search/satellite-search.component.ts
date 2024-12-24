import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface SatelliteFilters {
  name?: string;
  norad_id?: number;
  type?: string;
  mission?: string;
  min_altitude?: number;
  max_altitude?: number;
}

@Component({
  selector: 'app-satellite-search',
  templateUrl: './satellite-search.component.html',
  styleUrls: ['./satellite-search.component.css'], 
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class SatelliteSearchComponent {
  @Output() filtersApplied = new EventEmitter<SatelliteFilters>();

  filters: SatelliteFilters = {};
  private filtersSubject = new Subject<SatelliteFilters>();

  constructor() {
    this.filtersSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
      )
      .subscribe((filters) => {
        this.filtersApplied.emit(filters);
      });
  }

  applyFilters(): void {
    this.filtersSubject.next(this.filters);
  }

  resetFilters(): void {
    this.filters = {};
    this.filtersSubject.next(this.filters);
  }
}