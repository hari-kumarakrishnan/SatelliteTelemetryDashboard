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
  styleUrls: ['./satellite-search.component.css'], // Ensure this file exists
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
        debounceTime(500), // Debounce for 500ms
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
      )
      .subscribe((filters) => {
        this.filtersApplied.emit(filters);
      });
  }

  /**
   * Emits the current filters when inputs change.
   */
  applyFilters(): void {
    this.filtersSubject.next(this.filters);
  }

  /**
   * Resets all filters and emits the empty filter object.
   */
  resetFilters(): void {
    this.filters = {};
    this.filtersSubject.next(this.filters);
  }
}