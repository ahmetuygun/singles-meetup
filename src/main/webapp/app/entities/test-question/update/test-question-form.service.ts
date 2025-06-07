import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { ITestQuestion, NewTestQuestion } from '../test-question.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts ITestQuestion for edit and NewTestQuestionFormGroupInput for create.
 */
type TestQuestionFormGroupInput = ITestQuestion | PartialWithRequiredKeyOf<NewTestQuestion>;

type TestQuestionFormDefaults = Pick<NewTestQuestion, 'id' | 'isRequired'>;

type TestQuestionFormGroupContent = {
  id: FormControl<ITestQuestion['id'] | NewTestQuestion['id']>;
  questionText: FormControl<ITestQuestion['questionText']>;
  questionType: FormControl<ITestQuestion['questionType']>;
  stepNumber: FormControl<ITestQuestion['stepNumber']>;
  isRequired: FormControl<ITestQuestion['isRequired']>;
  category: FormControl<ITestQuestion['category']>;
  language: FormControl<ITestQuestion['language']>;
};

export type TestQuestionFormGroup = FormGroup<TestQuestionFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class TestQuestionFormService {
  createTestQuestionFormGroup(testQuestion: TestQuestionFormGroupInput = { id: null }): TestQuestionFormGroup {
    const testQuestionRawValue = {
      ...this.getFormDefaults(),
      ...testQuestion,
    };
    return new FormGroup<TestQuestionFormGroupContent>({
      id: new FormControl(
        { value: testQuestionRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      questionText: new FormControl(testQuestionRawValue.questionText, {
        validators: [Validators.required],
      }),
      questionType: new FormControl(testQuestionRawValue.questionType, {
        validators: [Validators.required],
      }),
      stepNumber: new FormControl(testQuestionRawValue.stepNumber),
      isRequired: new FormControl(testQuestionRawValue.isRequired, {
        validators: [Validators.required],
      }),
      category: new FormControl(testQuestionRawValue.category),
      language: new FormControl(testQuestionRawValue.language, {
        validators: [Validators.required],
      }),
    });
  }

  getTestQuestion(form: TestQuestionFormGroup): ITestQuestion | NewTestQuestion {
    return form.getRawValue() as ITestQuestion | NewTestQuestion;
  }

  resetForm(form: TestQuestionFormGroup, testQuestion: TestQuestionFormGroupInput): void {
    const testQuestionRawValue = { ...this.getFormDefaults(), ...testQuestion };
    form.reset(
      {
        ...testQuestionRawValue,
        id: { value: testQuestionRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): TestQuestionFormDefaults {
    return {
      id: null,
      isRequired: false,
    };
  }
}
