import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ITestQuestion } from 'app/entities/test-question/test-question.model';
import { TestQuestionService } from 'app/entities/test-question/service/test-question.service';
import { IPersonProfile } from 'app/entities/person-profile/person-profile.model';
import { PersonProfileService } from 'app/entities/person-profile/service/person-profile.service';
import { ITestAnswerOption } from 'app/entities/test-answer-option/test-answer-option.model';
import { TestAnswerOptionService } from 'app/entities/test-answer-option/service/test-answer-option.service';
import { UserTestAnswerService } from '../service/user-test-answer.service';
import { IUserTestAnswer } from '../user-test-answer.model';
import { UserTestAnswerFormGroup, UserTestAnswerFormService } from './user-test-answer-form.service';

@Component({
  selector: 'jhi-user-test-answer-update',
  templateUrl: './user-test-answer-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class UserTestAnswerUpdateComponent implements OnInit {
  isSaving = false;
  userTestAnswer: IUserTestAnswer | null = null;

  testQuestionsSharedCollection: ITestQuestion[] = [];
  personProfilesSharedCollection: IPersonProfile[] = [];
  testAnswerOptionsSharedCollection: ITestAnswerOption[] = [];

  protected userTestAnswerService = inject(UserTestAnswerService);
  protected userTestAnswerFormService = inject(UserTestAnswerFormService);
  protected testQuestionService = inject(TestQuestionService);
  protected personProfileService = inject(PersonProfileService);
  protected testAnswerOptionService = inject(TestAnswerOptionService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: UserTestAnswerFormGroup = this.userTestAnswerFormService.createUserTestAnswerFormGroup();

  compareTestQuestion = (o1: ITestQuestion | null, o2: ITestQuestion | null): boolean =>
    this.testQuestionService.compareTestQuestion(o1, o2);

  comparePersonProfile = (o1: IPersonProfile | null, o2: IPersonProfile | null): boolean =>
    this.personProfileService.comparePersonProfile(o1, o2);

  compareTestAnswerOption = (o1: ITestAnswerOption | null, o2: ITestAnswerOption | null): boolean =>
    this.testAnswerOptionService.compareTestAnswerOption(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ userTestAnswer }) => {
      this.userTestAnswer = userTestAnswer;
      if (userTestAnswer) {
        this.updateForm(userTestAnswer);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const userTestAnswer = this.userTestAnswerFormService.getUserTestAnswer(this.editForm);
    if (userTestAnswer.id !== null) {
      this.subscribeToSaveResponse(this.userTestAnswerService.update(userTestAnswer));
    } else {
      this.subscribeToSaveResponse(this.userTestAnswerService.create(userTestAnswer));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IUserTestAnswer>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(userTestAnswer: IUserTestAnswer): void {
    this.userTestAnswer = userTestAnswer;
    this.userTestAnswerFormService.resetForm(this.editForm, userTestAnswer);

    this.testQuestionsSharedCollection = this.testQuestionService.addTestQuestionToCollectionIfMissing<ITestQuestion>(
      this.testQuestionsSharedCollection,
      userTestAnswer.question,
    );
    this.personProfilesSharedCollection = this.personProfileService.addPersonProfileToCollectionIfMissing<IPersonProfile>(
      this.personProfilesSharedCollection,
      userTestAnswer.personProfile,
    );
    this.testAnswerOptionsSharedCollection = this.testAnswerOptionService.addTestAnswerOptionToCollectionIfMissing<ITestAnswerOption>(
      this.testAnswerOptionsSharedCollection,
      userTestAnswer.answer,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.testQuestionService
      .query()
      .pipe(map((res: HttpResponse<ITestQuestion[]>) => res.body ?? []))
      .pipe(
        map((testQuestions: ITestQuestion[]) =>
          this.testQuestionService.addTestQuestionToCollectionIfMissing<ITestQuestion>(testQuestions, this.userTestAnswer?.question),
        ),
      )
      .subscribe((testQuestions: ITestQuestion[]) => (this.testQuestionsSharedCollection = testQuestions));

    this.personProfileService
      .query()
      .pipe(map((res: HttpResponse<IPersonProfile[]>) => res.body ?? []))
      .pipe(
        map((personProfiles: IPersonProfile[]) =>
          this.personProfileService.addPersonProfileToCollectionIfMissing<IPersonProfile>(
            personProfiles,
            this.userTestAnswer?.personProfile,
          ),
        ),
      )
      .subscribe((personProfiles: IPersonProfile[]) => (this.personProfilesSharedCollection = personProfiles));

    this.testAnswerOptionService
      .query()
      .pipe(map((res: HttpResponse<ITestAnswerOption[]>) => res.body ?? []))
      .pipe(
        map((testAnswerOptions: ITestAnswerOption[]) =>
          this.testAnswerOptionService.addTestAnswerOptionToCollectionIfMissing<ITestAnswerOption>(
            testAnswerOptions,
            this.userTestAnswer?.answer,
          ),
        ),
      )
      .subscribe((testAnswerOptions: ITestAnswerOption[]) => (this.testAnswerOptionsSharedCollection = testAnswerOptions));
  }
}
