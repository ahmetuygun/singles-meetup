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
    protected router: Router
  ) {}

  ngOnInit(): void {
            this.load();
  }

  load(): void {
    this.isLoading = true;
    this.eventService.query().subscribe({
      next: (res) => {
        this.isLoading = false;
        this.events.set(res.body ?? []);
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

  navigateToEvent(id: number): void {
    this.router.navigate(['/event', id, 'view']);
  }
}
