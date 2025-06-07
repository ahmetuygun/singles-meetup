import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { TestQuestionService } from '../service/test-question.service';
import { ITestQuestion } from '../test-question.model';
import { TestQuestionFormService } from './test-question-form.service';

import { TestQuestionUpdateComponent } from './test-question-update.component';

describe('TestQuestion Management Update Component', () => {
  let comp: TestQuestionUpdateComponent;
  let fixture: ComponentFixture<TestQuestionUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let testQuestionFormService: TestQuestionFormService;
  let testQuestionService: TestQuestionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestQuestionUpdateComponent],
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
      .overrideTemplate(TestQuestionUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(TestQuestionUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    testQuestionFormService = TestBed.inject(TestQuestionFormService);
    testQuestionService = TestBed.inject(TestQuestionService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should update editForm', () => {
      const testQuestion: ITestQuestion = { id: 18143 };

      activatedRoute.data = of({ testQuestion });
      comp.ngOnInit();

      expect(comp.testQuestion).toEqual(testQuestion);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITestQuestion>>();
      const testQuestion = { id: 24178 };
      jest.spyOn(testQuestionFormService, 'getTestQuestion').mockReturnValue(testQuestion);
      jest.spyOn(testQuestionService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ testQuestion });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: testQuestion }));
      saveSubject.complete();

      // THEN
      expect(testQuestionFormService.getTestQuestion).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(testQuestionService.update).toHaveBeenCalledWith(expect.objectContaining(testQuestion));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITestQuestion>>();
      const testQuestion = { id: 24178 };
      jest.spyOn(testQuestionFormService, 'getTestQuestion').mockReturnValue({ id: null });
      jest.spyOn(testQuestionService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ testQuestion: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: testQuestion }));
      saveSubject.complete();

      // THEN
      expect(testQuestionFormService.getTestQuestion).toHaveBeenCalled();
      expect(testQuestionService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITestQuestion>>();
      const testQuestion = { id: 24178 };
      jest.spyOn(testQuestionService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ testQuestion });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(testQuestionService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
