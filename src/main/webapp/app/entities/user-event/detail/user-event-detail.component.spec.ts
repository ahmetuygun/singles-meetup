import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { UserEventDetailComponent } from './user-event-detail.component';

describe('UserEvent Management Detail Component', () => {
  let comp: UserEventDetailComponent;
  let fixture: ComponentFixture<UserEventDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserEventDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./user-event-detail.component').then(m => m.UserEventDetailComponent),
              resolve: { userEvent: () => of({ id: 16068 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(UserEventDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserEventDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load userEvent on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', UserEventDetailComponent);

      // THEN
      expect(instance.userEvent()).toEqual(expect.objectContaining({ id: 16068 }));
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
