import { Component, ElementRef, OnInit, OnDestroy, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxEditorModule, Editor, Toolbar, toHTML } from 'ngx-editor';

import { AlertError } from 'app/shared/alert/alert-error.model';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { DataUtils, FileLoadError } from 'app/core/util/data-util.service';
import { IVenue } from 'app/entities/venue/venue.model';
import { VenueService } from 'app/entities/venue/service/venue.service';
import { ITicket, NewTicket } from 'app/entities/ticket/ticket.model';
import { TicketService } from 'app/entities/ticket/service/ticket.service';
import { EventService } from '../service/event.service';
import { IEvent } from '../event.model';
import { EventFormGroup, EventFormService } from './event-form.service';

@Component({
  selector: 'jhi-event-update',
  templateUrl: './event-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule, NgxEditorModule],
})
export class EventUpdateComponent implements OnInit, OnDestroy {
  isSaving = false;
  event: IEvent | null = null;
  editor!: Editor;
  toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3'] }],
    ['link'],
  ];

  venuesSharedCollection: IVenue[] = [];
  eventTickets: ITicket[] = [];
  newTicket: NewTicket = this.getEmptyTicket();

  protected dataUtils = inject(DataUtils);
  protected eventManager = inject(EventManager);
  protected eventService = inject(EventService);
  protected eventFormService = inject(EventFormService);
  protected venueService = inject(VenueService);
  protected ticketService = inject(TicketService);
  protected elementRef = inject(ElementRef);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: EventFormGroup = this.eventFormService.createEventFormGroup();

  compareVenue = (o1: IVenue | null, o2: IVenue | null): boolean => this.venueService.compareVenue(o1, o2);

  ngOnInit(): void {
    this.editor = new Editor();
    
    this.activatedRoute.data.subscribe(({ event }) => {
      this.event = event;
      if (event) {
        this.updateForm(event);
        this.loadEventTickets(event.id);
      }

      this.loadRelationshipsOptions();
    });
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(base64String: string, contentType: string | null | undefined): void {
    this.dataUtils.openFile(base64String, contentType);
  }

  setFileData(event: Event, field: string, isImage: boolean): void {
    this.dataUtils.loadFileToForm(event, this.editForm, field, isImage).subscribe({
      error: (err: FileLoadError) =>
        this.eventManager.broadcast(new EventWithContent<AlertError>('singlesMeetup2App.error', { ...err, key: `error.file.${err.key}` })),
    });
  }

  clearInputImage(field: string, fieldContentType: string, idInput: string): void {
    this.editForm.patchValue({
      [field]: null,
      [fieldContentType]: null,
    });
    if (idInput && this.elementRef.nativeElement.querySelector(`#${idInput}`)) {
      this.elementRef.nativeElement.querySelector(`#${idInput}`).value = null;
    }
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const event = this.eventFormService.getEvent(this.editForm);
    
    // Convert ngx-editor document object to HTML string
    function isRecordStringAny(obj: any): obj is Record<string, any> {
      return typeof obj === 'object' && obj !== null;
    }

    if (isRecordStringAny(event.description)) {
      const html = toHTML(event.description);
      event.description = html;
    }
    
    // Validate description length
    if (event.description && event.description.length > 5000) {
      alert('Description cannot exceed 5000 characters. Current length: ' + event.description.length);
      this.isSaving = false;
      return;
    }
    
    if (event.id !== null) {
      this.subscribeToSaveResponse(this.eventService.update(event));
    } else {
      this.subscribeToSaveResponse(this.eventService.create(event));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IEvent>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(event: IEvent): void {
    this.event = event;
    this.eventFormService.resetForm(this.editForm, event);

    this.venuesSharedCollection = this.venueService.addVenueToCollectionIfMissing<IVenue>(this.venuesSharedCollection, event.venue);
  }

  protected loadRelationshipsOptions(): void {
    this.venueService
      .query()
      .pipe(map((res: HttpResponse<IVenue[]>) => res.body ?? []))
      .pipe(map((venues: IVenue[]) => this.venueService.addVenueToCollectionIfMissing<IVenue>(venues, this.event?.venue)))
      .subscribe((venues: IVenue[]) => (this.venuesSharedCollection = venues));
  }

  getEmptyTicket(): NewTicket {
    return {
      id: null,
      name: '',
      description: null,
      price: 0,
      bookingFee: 0,
      quantityAvailable: 1,
      quantitySold: 0,
      isActive: true,
      genderRestriction: null,
      earlyBird: null,
      event: null
    };
  }

  loadEventTickets(eventId: number): void {
    if (eventId) {
      this.ticketService.getTicketsByEvent(eventId).subscribe({
        next: (res) => {
          this.eventTickets = res.body || [];
        },
        error: (error) => {
          // Error loading event tickets
        }
      });
    }
  }

  addTicket(): void {
    if (this.newTicket.name && this.newTicket.name.trim() && this.newTicket.price !== null && this.newTicket.price !== undefined && this.newTicket.price >= 0) {
      if (this.event?.id) {
        // For existing events, save to backend
        const ticketToCreate = {
          ...this.newTicket,
          event: { id: this.event!.id, name: this.event!.name || '' }
        };
        
        this.ticketService.create(ticketToCreate).subscribe({
          next: (res) => {
            if (res.body) {
              this.eventTickets.push(res.body);
              this.newTicket = this.getEmptyTicket();
            }
          },
          error: (error) => {
            alert('Error creating ticket. Please try again.');
          }
        });
      } else {
        // For new events, just add to local array (will be saved when event is saved)
        const tempTicket: ITicket = {
          ...this.newTicket,
          id: Date.now(), // Temporary ID
          event: null
        };
        this.eventTickets.push(tempTicket);
        this.newTicket = this.getEmptyTicket();
      }
    } else {
      alert('Please fill in the ticket name and set a valid price (0 or higher).');
    }
  }

  removeTicket(index: number): void {
    const ticket = this.eventTickets[index];
    if (ticket.id && ticket.id > 0) {
      // Delete from backend if it has a real ID
      this.ticketService.delete(ticket.id).subscribe({
        next: () => {
          this.eventTickets.splice(index, 1);
        },
        error: (error) => {
          // Error deleting ticket
        }
      });
    } else {
      // Just remove from local array if it's a temporary ticket
      this.eventTickets.splice(index, 1);
    }
  }

  onTicketNameChange(value: string): void {
    this.newTicket.name = value;
  }

  onTicketPriceChange(value: number): void {
    this.newTicket.price = value;
  }

  onTicketBookingFeeChange(value: number): void {
    this.newTicket.bookingFee = value;
  }
}
