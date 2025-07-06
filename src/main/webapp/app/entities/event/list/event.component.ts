import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { Dayjs } from 'dayjs';

import SharedModule from 'app/shared/shared.module';
import { SortDirective, SortByDirective } from 'app/shared/sort';
import { FormatMediumDatetimePipe, FormatMediumDatePipe } from 'app/shared/date';
import HasAnyAuthorityDirective from 'app/shared/auth/has-any-authority.directive';
import { IEvent } from '../event.model';
import { EventService } from '../service/event.service';
import { AccountService } from 'app/core/auth/account.service';

@Component({
  selector: 'jhi-event',
  templateUrl: './event.component.html',
  standalone: true,
  imports: [
    RouterModule,
    FormsModule,
    SharedModule,
    SortDirective,
    SortByDirective,
    FormatMediumDatetimePipe,
    HasAnyAuthorityDirective,
    FormatMediumDatePipe
  ],
})
export class EventComponent implements OnInit {
  events = signal<IEvent[]>([]);
  isLoading = false;
  currentSearch = '';

  constructor(
    protected eventService: EventService,
    protected eventModalService: NgbModal,
    protected router: Router,
    protected accountService: AccountService
  ) {}

  ngOnInit(): void {
            this.load();
  }

  load(): void {
    this.isLoading = true;
    this.eventService.query().subscribe({
      next: (res) => {
        this.isLoading = false;
        const allEvents = res.body ?? [];
        
        // Only admins can see inactive events
        if (this.accountService.hasAnyAuthority('ROLE_ADMIN')) {
          // For admins, show all events including inactive ones
          this.events.set(allEvents);
        } else {
          // For unauthenticated users and regular users, filter out inactive events
          const filteredEvents = allEvents.filter(event => event.active !== false);
          this.events.set(filteredEvents);
        }
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  trackId(index: number, item: IEvent): number {
    return item.id!;
  }

  getEventHour(eventDate: Dayjs | null | undefined): string {
    if (!eventDate) return '';
    return eventDate.format('HH:mm');
  }

  getFormattedEventDate(eventDate: Dayjs | null | undefined): string {
    if (!eventDate) return '';
    return eventDate.format('D MMM, HH.mm');
  }

  getPlainTextDescription(description: string | null | undefined): string {
    if (!description) return '';
    // Create a temporary div to strip HTML tags
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = description;
    return tempDiv.textContent || tempDiv.innerText || '';
  }

  navigateToEvent(id: number): void {
    this.router.navigate(['/event', id, 'view']);
  }
}
