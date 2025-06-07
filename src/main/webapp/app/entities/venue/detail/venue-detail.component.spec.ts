import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { VenueDetailComponent } from './venue-detail.component';

describe('Venue Management Detail Component', () => {
  let comp: VenueDetailComponent;
  let fixture: ComponentFixture<VenueDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VenueDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./venue-detail.component').then(m => m.VenueDetailComponent),
              resolve: { venue: () => of({ id: 5387 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(VenueDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VenueDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load venue on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', VenueDetailComponent);

      // THEN
      expect(instance.venue()).toEqual(expect.objectContaining({ id: 5387 }));
    });
  });

  describe('PreviousState', () => {
    it('should navigate to previous state', () => {
      jest.spyOn(window.history, 'back');
      comp.previousState();
      expect(window.history.back).toHaveBeenCalled();
    });
  });
});
