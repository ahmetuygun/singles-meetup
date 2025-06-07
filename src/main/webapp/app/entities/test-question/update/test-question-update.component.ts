import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { QuestionType } from 'app/entities/enumerations/question-type.model';
import { ITestQuestion } from '../test-question.model';
import { TestQuestionService } from '../service/test-question.service';
import { TestQuestionFormGroup, TestQuestionFormService } from './test-question-form.service';

@Component({
  selector: 'jhi-test-question-update',
  templateUrl: './test-question-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class TestQuestionUpdateComponent implements OnInit {
  isSaving = false;
  testQuestion: ITestQuestion | null = null;
  questionTypeValues = Object.keys(QuestionType);

  protected testQuestionService = inject(TestQuestionService);
  protected testQuestionFormService = inject(TestQuestionFormService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: TestQuestionFormGroup = this.testQuestionFormService.createTestQuestionFormGroup();

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ testQuestion }) => {
      this.testQuestion = testQuestion;
      if (testQuestion) {
        this.updateForm(testQuestion);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const testQuestion = this.testQuestionFormService.getTestQuestion(this.editForm);
    if (testQuestion.id !== null) {
      this.subscribeToSaveResponse(this.testQuestionService.update(testQuestion));
    } else {
      this.subscribeToSaveResponse(this.testQuestionService.create(testQuestion));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ITestQuestion>>): void {
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

  protected updateForm(testQuestion: ITestQuestion): void {
    this.testQuestion = testQuestion;
    this.testQuestionFormService.resetForm(this.editForm, testQuestion);
  }
}
