import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { UserTestAnswerDetailComponent } from './user-test-answer-detail.component';

describe('UserTestAnswer Management Detail Component', () => {
  let comp: UserTestAnswerDetailComponent;
  let fixture: ComponentFixture<UserTestAnswerDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserTestAnswerDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./user-test-answer-detail.component').then(m => m.UserTestAnswerDetailComponent),
              resolve: { userTestAnswer: () => of({ id: 13099 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(UserTestAnswerDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserTestAnswerDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load userTestAnswer on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', UserTestAnswerDetailComponent);

      // THEN
      expect(instance.userTestAnswer()).toEqual(expect.objectContaining({ id: 13099 }));
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
