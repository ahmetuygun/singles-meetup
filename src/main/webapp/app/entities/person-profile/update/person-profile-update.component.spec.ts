import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/service/user.service';
import { IEvent } from 'app/entities/event/event.model';
import { EventService } from 'app/entities/event/service/event.service';
import { IPersonProfile } from '../person-profile.model';
import { PersonProfileService } from '../service/person-profile.service';
import { PersonProfileFormService } from './person-profile-form.service';

import { PersonProfileUpdateComponent } from './person-profile-update.component';

describe('PersonProfile Management Update Component', () => {
  let comp: PersonProfileUpdateComponent;
  let fixture: ComponentFixture<PersonProfileUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let personProfileFormService: PersonProfileFormService;
  let personProfileService: PersonProfileService;
  let userService: UserService;
  let eventService: EventService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PersonProfileUpdateComponent],
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
      .overrideTemplate(PersonProfileUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(PersonProfileUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    personProfileFormService = TestBed.inject(PersonProfileFormService);
    personProfileService = TestBed.inject(PersonProfileService);
    userService = TestBed.inject(UserService);
    eventService = TestBed.inject(EventService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call User query and add missing value', () => {
      const personProfile: IPersonProfile = { id: 22909 };
      const internalUser: IUser = { id: '1344246c-16a7-46d1-bb61-2043f965c8d5' };
      personProfile.internalUser = internalUser;

      const userCollection: IUser[] = [{ id: '1344246c-16a7-46d1-bb61-2043f965c8d5' }];
      jest.spyOn(userService, 'query').mockReturnValue(of(new HttpResponse({ body: userCollection })));
      const additionalUsers = [internalUser];
      const expectedCollection: IUser[] = [...additionalUsers, ...userCollection];
      jest.spyOn(userService, 'addUserToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ personProfile });
      comp.ngOnInit();

      expect(userService.query).toHaveBeenCalled();
      expect(userService.addUserToCollectionIfMissing).toHaveBeenCalledWith(
        userCollection,
        ...additionalUsers.map(expect.objectContaining),
      );
      expect(comp.usersSharedCollection).toEqual(expectedCollection);
    });

    it('should call Event query and add missing value', () => {
      const personProfile: IPersonProfile = { id: 22909 };
      const events: IEvent[] = [{ id: 22576 }];
      personProfile.events = events;

      const eventCollection: IEvent[] = [{ id: 22576 }];
      jest.spyOn(eventService, 'query').mockReturnValue(of(new HttpResponse({ body: eventCollection })));
      const additionalEvents = [...events];
      const expectedCollection: IEvent[] = [...additionalEvents, ...eventCollection];
      jest.spyOn(eventService, 'addEventToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ personProfile });
      comp.ngOnInit();

      expect(eventService.query).toHaveBeenCalled();
      expect(eventService.addEventToCollectionIfMissing).toHaveBeenCalledWith(
        eventCollection,
        ...additionalEvents.map(expect.objectContaining),
      );
      expect(comp.eventsSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const personProfile: IPersonProfile = { id: 22909 };
      const internalUser: IUser = { id: '1344246c-16a7-46d1-bb61-2043f965c8d5' };
      personProfile.internalUser = internalUser;
      const events: IEvent = { id: 22576 };
      personProfile.events = [events];

      activatedRoute.data = of({ personProfile });
      comp.ngOnInit();

      expect(comp.usersSharedCollection).toContainEqual(internalUser);
      expect(comp.eventsSharedCollection).toContainEqual(events);
      expect(comp.personProfile).toEqual(personProfile);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPersonProfile>>();
      const personProfile = { id: 25470 };
      jest.spyOn(personProfileFormService, 'getPersonProfile').mockReturnValue(personProfile);
      jest.spyOn(personProfileService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ personProfile });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: personProfile }));
      saveSubject.complete();

      // THEN
      expect(personProfileFormService.getPersonProfile).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(personProfileService.update).toHaveBeenCalledWith(expect.objectContaining(personProfile));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPersonProfile>>();
      const personProfile = { id: 25470 };
      jest.spyOn(personProfileFormService, 'getPersonProfile').mockReturnValue({ id: null });
      jest.spyOn(personProfileService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ personProfile: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: personProfile }));
      saveSubject.complete();

      // THEN
      expect(personProfileFormService.getPersonProfile).toHaveBeenCalled();
      expect(personProfileService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPersonProfile>>();
      const personProfile = { id: 25470 };
      jest.spyOn(personProfileService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ personProfile });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(personProfileService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareUser', () => {
      it('should forward to userService', () => {
        const entity = { id: '1344246c-16a7-46d1-bb61-2043f965c8d5' };
        const entity2 = { id: '1e61df13-b2d3-459d-875e-5607a4ccdbdb' };
        jest.spyOn(userService, 'compareUser');
        comp.compareUser(entity, entity2);
        expect(userService.compareUser).toHaveBeenCalledWith(entity, entity2);
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
