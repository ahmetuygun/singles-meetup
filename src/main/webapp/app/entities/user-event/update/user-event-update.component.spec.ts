import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IPersonProfile } from 'app/entities/person-profile/person-profile.model';
import { PersonProfileService } from 'app/entities/person-profile/service/person-profile.service';
import { IEvent } from 'app/entities/event/event.model';
import { EventService } from 'app/entities/event/service/event.service';
import { IUserEvent } from '../user-event.model';
import { UserEventService } from '../service/user-event.service';
import { UserEventFormService } from './user-event-form.service';

import { UserEventUpdateComponent } from './user-event-update.component';

describe('UserEvent Management Update Component', () => {
  let comp: UserEventUpdateComponent;
  let fixture: ComponentFixture<UserEventUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let userEventFormService: UserEventFormService;
  let userEventService: UserEventService;
  let personProfileService: PersonProfileService;
  let eventService: EventService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [UserEventUpdateComponent],
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
      .overrideTemplate(UserEventUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(UserEventUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    userEventFormService = TestBed.inject(UserEventFormService);
    userEventService = TestBed.inject(UserEventService);
    personProfileService = TestBed.inject(PersonProfileService);
    eventService = TestBed.inject(EventService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call PersonProfile query and add missing value', () => {
      const userEvent: IUserEvent = { id: 16449 };
      const personProfile: IPersonProfile = { id: 25470 };
      userEvent.personProfile = personProfile;

      const personProfileCollection: IPersonProfile[] = [{ id: 25470 }];
      jest.spyOn(personProfileService, 'query').mockReturnValue(of(new HttpResponse({ body: personProfileCollection })));
      const additionalPersonProfiles = [personProfile];
      const expectedCollection: IPersonProfile[] = [...additionalPersonProfiles, ...personProfileCollection];
      jest.spyOn(personProfileService, 'addPersonProfileToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ userEvent });
      comp.ngOnInit();

      expect(personProfileService.query).toHaveBeenCalled();
      expect(personProfileService.addPersonProfileToCollectionIfMissing).toHaveBeenCalledWith(
        personProfileCollection,
        ...additionalPersonProfiles.map(expect.objectContaining),
      );
      expect(comp.personProfilesSharedCollection).toEqual(expectedCollection);
    });

    it('should call Event query and add missing value', () => {
      const userEvent: IUserEvent = { id: 16449 };
      const event: IEvent = { id: 22576 };
      userEvent.event = event;

      const eventCollection: IEvent[] = [{ id: 22576 }];
      jest.spyOn(eventService, 'query').mockReturnValue(of(new HttpResponse({ body: eventCollection })));
      const additionalEvents = [event];
      const expectedCollection: IEvent[] = [...additionalEvents, ...eventCollection];
      jest.spyOn(eventService, 'addEventToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ userEvent });
      comp.ngOnInit();

      expect(eventService.query).toHaveBeenCalled();
      expect(eventService.addEventToCollectionIfMissing).toHaveBeenCalledWith(
        eventCollection,
        ...additionalEvents.map(expect.objectContaining),
      );
      expect(comp.eventsSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const userEvent: IUserEvent = { id: 16449 };
      const personProfile: IPersonProfile = { id: 25470 };
      userEvent.personProfile = personProfile;
      const event: IEvent = { id: 22576 };
      userEvent.event = event;

      activatedRoute.data = of({ userEvent });
      comp.ngOnInit();

      expect(comp.personProfilesSharedCollection).toContainEqual(personProfile);
      expect(comp.eventsSharedCollection).toContainEqual(event);
      expect(comp.userEvent).toEqual(userEvent);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IUserEvent>>();
      const userEvent = { id: 16068 };
      jest.spyOn(userEventFormService, 'getUserEvent').mockReturnValue(userEvent);
      jest.spyOn(userEventService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ userEvent });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: userEvent }));
      saveSubject.complete();

      // THEN
      expect(userEventFormService.getUserEvent).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(userEventService.update).toHaveBeenCalledWith(expect.objectContaining(userEvent));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IUserEvent>>();
      const userEvent = { id: 16068 };
      jest.spyOn(userEventFormService, 'getUserEvent').mockReturnValue({ id: null });
      jest.spyOn(userEventService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ userEvent: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: userEvent }));
      saveSubject.complete();

      // THEN
      expect(userEventFormService.getUserEvent).toHaveBeenCalled();
      expect(userEventService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IUserEvent>>();
      const userEvent = { id: 16068 };
      jest.spyOn(userEventService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ userEvent });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(userEventService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('comparePersonProfile', () => {
      it('should forward to personProfileService', () => {
        const entity = { id: 25470 };
        const entity2 = { id: 22909 };
        jest.spyOn(personProfileService, 'comparePersonProfile');
        comp.comparePersonProfile(entity, entity2);
        expect(personProfileService.comparePersonProfile).toHaveBeenCalledWith(entity, entity2);
      });
    });

    describe('compareEvent', () => {
      it('should forward to eventService', () => {
        const entity = { id: 22576 };
        const entity2 = { id: 3268 };
        jest.spyOn(eventService, 'compareEvent');
        comp.compareEvent(entity, entity2);
        expect(eventService.compareEvent).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
