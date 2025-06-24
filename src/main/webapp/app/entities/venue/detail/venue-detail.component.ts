import { Component, input, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import SharedModule from 'app/shared/shared.module';
import { IVenue } from '../venue.model';
import { VenueService } from '../service/venue.service';

@Component({
  selector: 'jhi-venue-detail',
  templateUrl: './venue-detail.component.html',
  imports: [SharedModule, RouterModule, CommonModule],
})
export class VenueDetailComponent implements OnInit {
  venue = input<IVenue | null>(null);

  constructor(
    private router: Router,
    private venueService: VenueService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    console.log('VenueDetailComponent initialized');
    console.log('Venue input:', this.venue());
  }

  getGoogleMapsEmbedUrl(lat: number, lng: number, name: string): SafeResourceUrl {
    const encodedName = encodeURIComponent(name);
    const url = `https://www.google.com/maps/embed/v1/place?key=&q=${lat},${lng}&zoom=15&maptype=roadmap`;
    // Alternative without API key - using search with coordinates
    const fallbackUrl = `https://maps.google.com/maps?q=${lat},${lng}&hl=en&z=15&output=embed`;
    
    console.log('Generated map URL:', fallbackUrl);
    return this.sanitizer.bypassSecurityTrustResourceUrl(fallbackUrl);
  }

  delete(venue: IVenue): void {
    if (confirm(`Are you sure you want to delete ${venue.name}?`)) {
      this.venueService.delete(venue.id).subscribe({
        next: () => {
          this.router.navigate(['/venue']);
        },
        error: (error) => {
          console.error('Error deleting venue:', error);
        }
      });
    }
  }

  previousState(): void {
    window.history.back();
  }
}
