import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IVenue } from 'app/entities/venue/venue.model';
import { VenueService } from 'app/entities/venue/service/venue.service';
import { IPersonProfile } from 'app/entities/person-profile/person-profile.model';
import { PersonProfileService } from 'app/entities/person-profile/service/person-profile.service';
import { IEvent } from '../event.model';
import { EventService } from '../service/event.service';
import { EventFormService } from './event-form.service';

import { EventUpdateComponent } from './event-update.component';

describe('Event Management Update Component', () => {
  let comp: EventUpdateComponent;
  let fixture: ComponentFixture<EventUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let eventFormService: EventFormService;
  let eventService: EventService;
  let venueService: VenueService;
  let personProfileService: PersonProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EventUpdateComponent],
      providers: [
        provideHttpClient(),
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            params: from([{}]),
          },
        },
      ],
    })
      .overrideTemplate(EventUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(EventUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    eventFormService = TestBed.inject(EventFormService);
    eventService = TestBed.inject(EventService);
    venueService = TestBed.inject(VenueService);
    personProfileService = TestBed.inject(PersonProfileService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call Venue query and add missing value', () => {
      const event: IEvent = { id: 3268 };
      const venue: IVenue = { id: 5387 };
      event.venue = venue;

      const venueCollection: IVenue[] = [{ id: 5387 }];
      jest.spyOn(venueService, 'query').mockReturnValue(of(new HttpResponse({ body: venueCollection })));
      const additionalVenues = [venue];
      const expectedCollection: IVenue[] = [...additionalVenues, ...venueCollection];
      jest.spyOn(venueService, 'addVenueToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ event });
      comp.ngOnInit();

      expect(venueService.query).toHaveBeenCalled();
      expect(venueService.addVenueToCollectionIfMissing).toHaveBeenCalledWith(
        venueCollection,
        ...additionalVenues.map(expect.objectContaining),
      );
      expect(comp.venuesSharedCollection).toEqual(expectedCollection);
    });

    it('should call PersonProfile query and add missing value', () => {
      const event: IEvent = { id: 3268 };
      const participants: IPersonProfile[] = [{ id: 25470 }];
      event.participants = participants;

      const personProfileCollection: IPersonProfile[] = [{ id: 25470 }];
      jest.spyOn(personProfileService, 'query').mockReturnValue(of(new HttpResponse({ body: personProfileCollection })));
      const additionalPersonProfiles = [...participants];
      const expectedCollection: IPersonProfile[] = [...additionalPersonProfiles, ...personProfileCollection];
      jest.spyOn(personProfileService, 'addPersonProfileToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ event });
      comp.ngOnInit();

      expect(personProfileService.query).toHaveBeenCalled();
      expect(personProfileService.addPersonProfileToCollectionIfMissing).toHaveBeenCalledWith(
        personProfileCollection,
        ...additionalPersonProfiles.map(expect.objectContaining),
      );
      expect(comp.personProfilesSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const event: IEvent = { id: 3268 };
      const venue: IVenue = { id: 5387 };
      event.venue = venue;
      const participants: IPersonProfile = { id: 25470 };
      event.participants = [participants];

      activatedRoute.data = of({ event });
      comp.ngOnInit();

      expect(comp.venuesSharedCollection).toContainEqual(venue);
      expect(comp.personProfilesSharedCollection).toContainEqual(participants);
      expect(comp.event).toEqual(event);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IEvent>>();
      const event = { id: 22576 };
      jest.spyOn(eventFormService, 'getEvent').mockReturnValue(event);
      jest.spyOn(eventService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ event });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: event }));
      saveSubject.complete();

      // THEN
      expect(eventFormService.getEvent).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(eventService.update).toHaveBeenCalledWith(expect.objectContaining(event));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IEvent>>();
      const event = { id: 22576 };
      jest.spyOn(eventFormService, 'getEvent').mockReturnValue({ id: null });
      jest.spyOn(eventService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ event: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: event }));
      saveSubject.complete();

      // THEN
      expect(eventFormService.getEvent).toHaveBeenCalled();
      expect(eventService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IEvent>>();
      const event = { id: 22576 };
      jest.spyOn(eventService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ event });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(eventService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareVenue', () => {
      it('should forward to venueService', () => {
        const entity = { id: 5387 };
        const entity2 = { id: 22163 };
        jest.spyOn(venueService, 'compareVenue');
        comp.compareVenue(entity, entity2);
        expect(venueService.compareVenue).toHaveBeenCalledWith(entity, entity2);
      });
    });

    describe('comparePersonProfile', () => {
      it('should forward to personProfileService', () => {
        const entity = { id: 25470 };
        const entity2 = { id: 22909 };
        jest.spyOn(personProfileService, 'comparePersonProfile');
        comp.comparePersonProfile(entity, entity2);
        expect(personProfileService.comparePersonProfile).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
