import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ITestQuestion } from 'app/entities/test-question/test-question.model';
import { TestQuestionService } from 'app/entities/test-question/service/test-question.service';
import { ITestAnswerOption } from '../test-answer-option.model';
import { TestAnswerOptionService } from '../service/test-answer-option.service';
import { TestAnswerOptionFormGroup, TestAnswerOptionFormService } from './test-answer-option-form.service';

@Component({
  selector: 'jhi-test-answer-option-update',
  templateUrl: './test-answer-option-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class TestAnswerOptionUpdateComponent implements OnInit {
  isSaving = false;
  testAnswerOption: ITestAnswerOption | null = null;

  testQuestionsSharedCollection: ITestQuestion[] = [];

  protected testAnswerOptionService = inject(TestAnswerOptionService);
  protected testAnswerOptionFormService = inject(TestAnswerOptionFormService);
  protected testQuestionService = inject(TestQuestionService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: TestAnswerOptionFormGroup = this.testAnswerOptionFormService.createTestAnswerOptionFormGroup();

  compareTestQuestion = (o1: ITestQuestion | null, o2: ITestQuestion | null): boolean =>
    this.testQuestionService.compareTestQuestion(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ testAnswerOption }) => {
      this.testAnswerOption = testAnswerOption;
      if (testAnswerOption) {
        this.updateForm(testAnswerOption);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const testAnswerOption = this.testAnswerOptionFormService.getTestAnswerOption(this.editForm);
    if (testAnswerOption.id !== null) {
      this.subscribeToSaveResponse(this.testAnswerOptionService.update(testAnswerOption));
    } else {
      this.subscribeToSaveResponse(this.testAnswerOptionService.create(testAnswerOption));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ITestAnswerOption>>): void {
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

  protected updateForm(testAnswerOption: ITestAnswerOption): void {
    this.testAnswerOption = testAnswerOption;
    this.testAnswerOptionFormService.resetForm(this.editForm, testAnswerOption);

    this.testQuestionsSharedCollection = this.testQuestionService.addTestQuestionToCollectionIfMissing<ITestQuestion>(
      this.testQuestionsSharedCollection,
      testAnswerOption.question,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.testQuestionService
      .query()
      .pipe(map((res: HttpResponse<ITestQuestion[]>) => res.body ?? []))
      .pipe(
        map((testQuestions: ITestQuestion[]) =>
          this.testQuestionService.addTestQuestionToCollectionIfMissing<ITestQuestion>(testQuestions, this.testAnswerOption?.question),
        ),
      )
      .subscribe((testQuestions: ITestQuestion[]) => (this.testQuestionsSharedCollection = testQuestions));
  }
}
