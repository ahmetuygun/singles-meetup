import { Component, NgZone, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Data, ParamMap, Router, RouterModule } from '@angular/router';
import { Observable, Subscription, combineLatest, filter, tap } from 'rxjs';

import SharedModule from 'app/shared/shared.module';
import { SortByDirective, SortDirective, SortService, type SortState, sortStateSignal } from 'app/shared/sort';
import { FormsModule } from '@angular/forms';
import { DEFAULT_SORT_DATA, SORT } from 'app/config/navigation.constants';
import { IUserEvent } from '../../user-event/user-event.model';
import { EntityArrayResponseType, UserEventService } from '../../user-event/service/user-event.service';
import { IEvent } from '../event.model';

@Component({
  selector: 'jhi-event-joiners',
  templateUrl: './event-joiners.component.html',
  imports: [RouterModule, FormsModule, SharedModule, SortDirective, SortByDirective],
})
export class EventJoinersComponent implements OnInit {
  subscription: Subscription | null = null;
  userEvents = signal<IUserEvent[]>([]);
  event = signal<IEvent | null>(null);
  isLoading = false;
  eventId: number | null = null;

  sortState = sortStateSignal({});

  public readonly router = inject(Router);
  protected readonly userEventService = inject(UserEventService);
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly sortService = inject(SortService);
  protected ngZone = inject(NgZone);

  trackId = (item: IUserEvent): number => this.userEventService.getUserEventIdentifier(item);

  ngOnInit(): void {
    this.subscription = combineLatest([this.activatedRoute.queryParamMap, this.activatedRoute.data, this.activatedRoute.params])
      .pipe(
        tap(([params, data, routeParams]) => {
          this.eventId = +routeParams['id'];
          this.event.set(data['event']);
          this.fillComponentAttributeFromRoute(params, data);
        }),
        tap(() => {
          if (this.userEvents().length === 0) {
            this.load();
          } else {
            this.userEvents.set(this.refineData(this.userEvents()));
          }
        }),
      )
      .subscribe();
  }

  load(): void {
    this.queryBackend().subscribe({
      next: (res: EntityArrayResponseType) => {
        this.onResponseSuccess(res);
      },
    });
  }

  navigateToWithComponentValues(event: SortState): void {
    this.handleNavigation(event);
  }

  previousState(): void {
    window.history.back();
  }

  protected fillComponentAttributeFromRoute(params: ParamMap, data: Data): void {
    this.sortState.set(this.sortService.parseSortParam(params.get(SORT) ?? data[DEFAULT_SORT_DATA]));
  }

  protected onResponseSuccess(response: EntityArrayResponseType): void {
    const dataFromBody = this.fillComponentAttributesFromResponseBody(response.body);
    this.userEvents.set(this.refineData(dataFromBody));
  }

  protected refineData(data: IUserEvent[]): IUserEvent[] {
    const { predicate, order } = this.sortState();
    return predicate && order ? data.sort(this.sortService.startSort({ predicate, order })) : data;
  }

  protected fillComponentAttributesFromResponseBody(data: IUserEvent[] | null): IUserEvent[] {
    return data ?? [];
  }

  protected queryBackend(): Observable<EntityArrayResponseType> {
    this.isLoading = true;
    const queryObject: any = {
      sort: this.sortService.buildSortParam(this.sortState()),
      eventId: this.eventId // Filter by event ID
    };
    return this.userEventService.query(queryObject).pipe(tap(() => (this.isLoading = false)));
  }

  protected handleNavigation(sortState: SortState): void {
    const queryParamsObj = {
      sort: this.sortService.buildSortParam(sortState),
    };

    this.ngZone.run(() => {
      this.router.navigate(['./'], {
        relativeTo: this.activatedRoute,
        queryParams: queryParamsObj,
      });
    });
  }

  getAge(dob: any): number {
    if (!dob) return 0;
    const today = new Date();
    const birthDate = dob.toDate ? dob.toDate() : new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  getPaymentStatusBadgeClass(paymentStatus: string): string {
    switch (paymentStatus) {
      case 'PAID':
        return 'bg-success';
      case 'PENDING':
        return 'bg-warning text-dark';
      case 'UNPAID':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  viewParticipantProfile(userEvent: IUserEvent): void {
    if (userEvent.personProfile?.id) {
      this.router.navigate(['/person-profile', userEvent.personProfile.id, 'view']);
    }
  }

  toggleCheckIn(userEvent: IUserEvent): void {
    if (!userEvent.id) return;
    
    const updatedStatus = !userEvent.checkedIn;
    const currentUserEvents = this.userEvents();
    
    // Optimistically update the UI
    const updatedUserEvents = currentUserEvents.map(ue => 
      ue.id === userEvent.id ? { ...ue, checkedIn: updatedStatus } : ue
    );
    this.userEvents.set(updatedUserEvents);

    // Update in the backend
    this.userEventService.partialUpdate({
      id: userEvent.id,
      checkedIn: updatedStatus
    }).subscribe({
      next: (response) => {
        // Update with server response while preserving existing profile data
        if (response.body) {
          const serverUpdatedUserEvents = this.userEvents().map(ue => 
            ue.id === userEvent.id ? { 
              ...ue, 
              checkedIn: response.body!.checkedIn,
              // Preserve other fields that might not be returned by the backend
              personProfile: ue.personProfile,
              event: ue.event
            } : ue
          );
          this.userEvents.set(serverUpdatedUserEvents);
        }
        console.log(`Participant ${updatedStatus ? 'checked in' : 'checked out'} successfully`);
      },
      error: (error) => {
        // Revert on error
        this.userEvents.set(currentUserEvents);
        console.error('Failed to update check-in status:', error);
        // The user will see the UI revert, indicating the operation failed
      }
    });
  }


} 