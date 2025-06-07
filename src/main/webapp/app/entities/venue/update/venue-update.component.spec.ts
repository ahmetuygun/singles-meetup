import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { VenueService } from '../service/venue.service';
import { IVenue } from '../venue.model';
import { VenueFormService } from './venue-form.service';

import { VenueUpdateComponent } from './venue-update.component';

describe('Venue Management Update Component', () => {
  let comp: VenueUpdateComponent;
  let fixture: ComponentFixture<VenueUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let venueFormService: VenueFormService;
  let venueService: VenueService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [VenueUpdateComponent],
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
      .overrideTemplate(VenueUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(VenueUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    venueFormService = TestBed.inject(VenueFormService);
    venueService = TestBed.inject(VenueService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should update editForm', () => {
      const venue: IVenue = { id: 22163 };

      activatedRoute.data = of({ venue });
      comp.ngOnInit();

      expect(comp.venue).toEqual(venue);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IVenue>>();
      const venue = { id: 5387 };
      jest.spyOn(venueFormService, 'getVenue').mockReturnValue(venue);
      jest.spyOn(venueService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ venue });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: venue }));
      saveSubject.complete();

      // THEN
      expect(venueFormService.getVenue).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(venueService.update).toHaveBeenCalledWith(expect.objectContaining(venue));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IVenue>>();
      const venue = { id: 5387 };
      jest.spyOn(venueFormService, 'getVenue').mockReturnValue({ id: null });
      jest.spyOn(venueService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ venue: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: venue }));
      saveSubject.complete();

      // THEN
      expect(venueFormService.getVenue).toHaveBeenCalled();
      expect(venueService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IVenue>>();
      const venue = { id: 5387 };
      jest.spyOn(venueService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ venue });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(venueService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
