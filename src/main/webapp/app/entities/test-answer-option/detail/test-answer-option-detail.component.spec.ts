import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { TestAnswerOptionDetailComponent } from './test-answer-option-detail.component';

describe('TestAnswerOption Management Detail Component', () => {
  let comp: TestAnswerOptionDetailComponent;
  let fixture: ComponentFixture<TestAnswerOptionDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestAnswerOptionDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./test-answer-option-detail.component').then(m => m.TestAnswerOptionDetailComponent),
              resolve: { testAnswerOption: () => of({ id: 15811 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(TestAnswerOptionDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestAnswerOptionDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load testAnswerOption on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', TestAnswerOptionDetailComponent);

      // THEN
      expect(instance.testAnswerOption()).toEqual(expect.objectContaining({ id: 15811 }));
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
