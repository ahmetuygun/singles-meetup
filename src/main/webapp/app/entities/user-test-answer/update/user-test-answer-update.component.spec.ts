import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { ITestQuestion } from 'app/entities/test-question/test-question.model';
import { TestQuestionService } from 'app/entities/test-question/service/test-question.service';
import { IPersonProfile } from 'app/entities/person-profile/person-profile.model';
import { PersonProfileService } from 'app/entities/person-profile/service/person-profile.service';
import { ITestAnswerOption } from 'app/entities/test-answer-option/test-answer-option.model';
import { TestAnswerOptionService } from 'app/entities/test-answer-option/service/test-answer-option.service';
import { IUserTestAnswer } from '../user-test-answer.model';
import { UserTestAnswerService } from '../service/user-test-answer.service';
import { UserTestAnswerFormService } from './user-test-answer-form.service';

import { UserTestAnswerUpdateComponent } from './user-test-answer-update.component';

describe('UserTestAnswer Management Update Component', () => {
  let comp: UserTestAnswerUpdateComponent;
  let fixture: ComponentFixture<UserTestAnswerUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let userTestAnswerFormService: UserTestAnswerFormService;
  let userTestAnswerService: UserTestAnswerService;
  let testQuestionService: TestQuestionService;
  let personProfileService: PersonProfileService;
  let testAnswerOptionService: TestAnswerOptionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [UserTestAnswerUpdateComponent],
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
      .overrideTemplate(UserTestAnswerUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(UserTestAnswerUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    userTestAnswerFormService = TestBed.inject(UserTestAnswerFormService);
    userTestAnswerService = TestBed.inject(UserTestAnswerService);
    testQuestionService = TestBed.inject(TestQuestionService);
    personProfileService = TestBed.inject(PersonProfileService);
    testAnswerOptionService = TestBed.inject(TestAnswerOptionService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call TestQuestion query and add missing value', () => {
      const userTestAnswer: IUserTestAnswer = { id: 5655 };
      const question: ITestQuestion = { id: 24178 };
      userTestAnswer.question = question;

      const testQuestionCollection: ITestQuestion[] = [{ id: 24178 }];
      jest.spyOn(testQuestionService, 'query').mockReturnValue(of(new HttpResponse({ body: testQuestionCollection })));
      const additionalTestQuestions = [question];
      const expectedCollection: ITestQuestion[] = [...additionalTestQuestions, ...testQuestionCollection];
      jest.spyOn(testQuestionService, 'addTestQuestionToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ userTestAnswer });
      comp.ngOnInit();

      expect(testQuestionService.query).toHaveBeenCalled();
      expect(testQuestionService.addTestQuestionToCollectionIfMissing).toHaveBeenCalledWith(
        testQuestionCollection,
        ...additionalTestQuestions.map(expect.objectContaining),
      );
      expect(comp.testQuestionsSharedCollection).toEqual(expectedCollection);
    });

    it('should call PersonProfile query and add missing value', () => {
      const userTestAnswer: IUserTestAnswer = { id: 5655 };
      const personProfile: IPersonProfile = { id: 25470 };
      userTestAnswer.personProfile = personProfile;

      const personProfileCollection: IPersonProfile[] = [{ id: 25470 }];
      jest.spyOn(personProfileService, 'query').mockReturnValue(of(new HttpResponse({ body: personProfileCollection })));
      const additionalPersonProfiles = [personProfile];
      const expectedCollection: IPersonProfile[] = [...additionalPersonProfiles, ...personProfileCollection];
      jest.spyOn(personProfileService, 'addPersonProfileToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ userTestAnswer });
      comp.ngOnInit();

      expect(personProfileService.query).toHaveBeenCalled();
      expect(personProfileService.addPersonProfileToCollectionIfMissing).toHaveBeenCalledWith(
        personProfileCollection,
        ...additionalPersonProfiles.map(expect.objectContaining),
      );
      expect(comp.personProfilesSharedCollection).toEqual(expectedCollection);
    });

    it('should call TestAnswerOption query and add missing value', () => {
      const userTestAnswer: IUserTestAnswer = { id: 5655 };
      const answer: ITestAnswerOption = { id: 15811 };
      userTestAnswer.answer = answer;

      const testAnswerOptionCollection: ITestAnswerOption[] = [{ id: 15811 }];
      jest.spyOn(testAnswerOptionService, 'query').mockReturnValue(of(new HttpResponse({ body: testAnswerOptionCollection })));
      const additionalTestAnswerOptions = [answer];
      const expectedCollection: ITestAnswerOption[] = [...additionalTestAnswerOptions, ...testAnswerOptionCollection];
      jest.spyOn(testAnswerOptionService, 'addTestAnswerOptionToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ userTestAnswer });
      comp.ngOnInit();

      expect(testAnswerOptionService.query).toHaveBeenCalled();
      expect(testAnswerOptionService.addTestAnswerOptionToCollectionIfMissing).toHaveBeenCalledWith(
        testAnswerOptionCollection,
        ...additionalTestAnswerOptions.map(expect.objectContaining),
      );
      expect(comp.testAnswerOptionsSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const userTestAnswer: IUserTestAnswer = { id: 5655 };
      const question: ITestQuestion = { id: 24178 };
      userTestAnswer.question = question;
      const personProfile: IPersonProfile = { id: 25470 };
      userTestAnswer.personProfile = personProfile;
      const answer: ITestAnswerOption = { id: 15811 };
      userTestAnswer.answer = answer;

      activatedRoute.data = of({ userTestAnswer });
      comp.ngOnInit();

      expect(comp.testQuestionsSharedCollection).toContainEqual(question);
      expect(comp.personProfilesSharedCollection).toContainEqual(personProfile);
      expect(comp.testAnswerOptionsSharedCollection).toContainEqual(answer);
      expect(comp.userTestAnswer).toEqual(userTestAnswer);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IUserTestAnswer>>();
      const userTestAnswer = { id: 13099 };
      jest.spyOn(userTestAnswerFormService, 'getUserTestAnswer').mockReturnValue(userTestAnswer);
      jest.spyOn(userTestAnswerService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ userTestAnswer });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: userTestAnswer }));
      saveSubject.complete();

      // THEN
      expect(userTestAnswerFormService.getUserTestAnswer).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(userTestAnswerService.update).toHaveBeenCalledWith(expect.objectContaining(userTestAnswer));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IUserTestAnswer>>();
      const userTestAnswer = { id: 13099 };
      jest.spyOn(userTestAnswerFormService, 'getUserTestAnswer').mockReturnValue({ id: null });
      jest.spyOn(userTestAnswerService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ userTestAnswer: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: userTestAnswer }));
      saveSubject.complete();

      // THEN
      expect(userTestAnswerFormService.getUserTestAnswer).toHaveBeenCalled();
      expect(userTestAnswerService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IUserTestAnswer>>();
      const userTestAnswer = { id: 13099 };
      jest.spyOn(userTestAnswerService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ userTestAnswer });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(userTestAnswerService.update).toHaveBeenCalled();
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

    describe('comparePersonProfile', () => {
      it('should forward to personProfileService', () => {
        const entity = { id: 25470 };
        const entity2 = { id: 22909 };
        jest.spyOn(personProfileService, 'comparePersonProfile');
        comp.comparePersonProfile(entity, entity2);
        expect(personProfileService.comparePersonProfile).toHaveBeenCalledWith(entity, entity2);
      });
    });

    describe('compareTestAnswerOption', () => {
      it('should forward to testAnswerOptionService', () => {
        const entity = { id: 15811 };
        const entity2 = { id: 13543 };
        jest.spyOn(testAnswerOptionService, 'compareTestAnswerOption');
        comp.compareTestAnswerOption(entity, entity2);
        expect(testAnswerOptionService.compareTestAnswerOption).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
