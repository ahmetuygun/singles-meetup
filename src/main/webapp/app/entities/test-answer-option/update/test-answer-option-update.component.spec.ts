import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { ITestQuestion } from 'app/entities/test-question/test-question.model';
import { TestQuestionService } from 'app/entities/test-question/service/test-question.service';
import { TestAnswerOptionService } from '../service/test-answer-option.service';
import { ITestAnswerOption } from '../test-answer-option.model';
import { TestAnswerOptionFormService } from './test-answer-option-form.service';

import { TestAnswerOptionUpdateComponent } from './test-answer-option-update.component';

describe('TestAnswerOption Management Update Component', () => {
  let comp: TestAnswerOptionUpdateComponent;
  let fixture: ComponentFixture<TestAnswerOptionUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let testAnswerOptionFormService: TestAnswerOptionFormService;
  let testAnswerOptionService: TestAnswerOptionService;
  let testQuestionService: TestQuestionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestAnswerOptionUpdateComponent],
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
      .overrideTemplate(TestAnswerOptionUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(TestAnswerOptionUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    testAnswerOptionFormService = TestBed.inject(TestAnswerOptionFormService);
    testAnswerOptionService = TestBed.inject(TestAnswerOptionService);
    testQuestionService = TestBed.inject(TestQuestionService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call TestQuestion query and add missing value', () => {
      const testAnswerOption: ITestAnswerOption = { id: 13543 };
      const question: ITestQuestion = { id: 24178 };
      testAnswerOption.question = question;

      const testQuestionCollection: ITestQuestion[] = [{ id: 24178 }];
      jest.spyOn(testQuestionService, 'query').mockReturnValue(of(new HttpResponse({ body: testQuestionCollection })));
      const additionalTestQuestions = [question];
      const expectedCollection: ITestQuestion[] = [...additionalTestQuestions, ...testQuestionCollection];
      jest.spyOn(testQuestionService, 'addTestQuestionToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ testAnswerOption });
      comp.ngOnInit();

      expect(testQuestionService.query).toHaveBeenCalled();
      expect(testQuestionService.addTestQuestionToCollectionIfMissing).toHaveBeenCalledWith(
        testQuestionCollection,
        ...additionalTestQuestions.map(expect.objectContaining),
      );
      expect(comp.testQuestionsSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const testAnswerOption: ITestAnswerOption = { id: 13543 };
      const question: ITestQuestion = { id: 24178 };
      testAnswerOption.question = question;

      activatedRoute.data = of({ testAnswerOption });
      comp.ngOnInit();

      expect(comp.testQuestionsSharedCollection).toContainEqual(question);
      expect(comp.testAnswerOption).toEqual(testAnswerOption);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITestAnswerOption>>();
      const testAnswerOption = { id: 15811 };
      jest.spyOn(testAnswerOptionFormService, 'getTestAnswerOption').mockReturnValue(testAnswerOption);
      jest.spyOn(testAnswerOptionService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ testAnswerOption });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: testAnswerOption }));
      saveSubject.complete();

      // THEN
      expect(testAnswerOptionFormService.getTestAnswerOption).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(testAnswerOptionService.update).toHaveBeenCalledWith(expect.objectContaining(testAnswerOption));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITestAnswerOption>>();
      const testAnswerOption = { id: 15811 };
      jest.spyOn(testAnswerOptionFormService, 'getTestAnswerOption').mockReturnValue({ id: null });
      jest.spyOn(testAnswerOptionService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ testAnswerOption: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: testAnswerOption }));
      saveSubject.complete();

      // THEN
      expect(testAnswerOptionFormService.getTestAnswerOption).toHaveBeenCalled();
      expect(testAnswerOptionService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITestAnswerOption>>();
      const testAnswerOption = { id: 15811 };
      jest.spyOn(testAnswerOptionService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ testAnswerOption });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(testAnswerOptionService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareTestQuestion', () => {
      it('should forward to testQuestionService', () => {
        const entity = { id: 24178 };
        const entity2 = { id: 18143 };
        jest.spyOn(testQuestionService, 'compareTestQuestion');
        comp.compareTestQuestion(entity, entity2);
        expect(testQuestionService.compareTestQuestion).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
