import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { ITestAnswerOption, NewTestAnswerOption } from '../test-answer-option.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts ITestAnswerOption for edit and NewTestAnswerOptionFormGroupInput for create.
 */
type TestAnswerOptionFormGroupInput = ITestAnswerOption | PartialWithRequiredKeyOf<NewTestAnswerOption>;

type TestAnswerOptionFormDefaults = Pick<NewTestAnswerOption, 'id'>;

type TestAnswerOptionFormGroupContent = {
  id: FormControl<ITestAnswerOption['id'] | NewTestAnswerOption['id']>;
  optionText: FormControl<ITestAnswerOption['optionText']>;
  value: FormControl<ITestAnswerOption['value']>;
  question: FormControl<ITestAnswerOption['question']>;
};

export type TestAnswerOptionFormGroup = FormGroup<TestAnswerOptionFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class TestAnswerOptionFormService {
  createTestAnswerOptionFormGroup(testAnswerOption: TestAnswerOptionFormGroupInput = { id: null }): TestAnswerOptionFormGroup {
    const testAnswerOptionRawValue = {
      ...this.getFormDefaults(),
      ...testAnswerOption,
    };
    return new FormGroup<TestAnswerOptionFormGroupContent>({
      id: new FormControl(
        { value: testAnswerOptionRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      optionText: new FormControl(testAnswerOptionRawValue.optionText, {
        validators: [Validators.required],
      }),
      value: new FormControl(testAnswerOptionRawValue.value),
      question: new FormControl(testAnswerOptionRawValue.question),
    });
  }

  getTestAnswerOption(form: TestAnswerOptionFormGroup): ITestAnswerOption | NewTestAnswerOption {
    return form.getRawValue() as ITestAnswerOption | NewTestAnswerOption;
  }

  resetForm(form: TestAnswerOptionFormGroup, testAnswerOption: TestAnswerOptionFormGroupInput): void {
    const testAnswerOptionRawValue = { ...this.getFormDefaults(), ...testAnswerOption };
    form.reset(
      {
        ...testAnswerOptionRawValue,
        id: { value: testAnswerOptionRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): TestAnswerOptionFormDefaults {
    return {
      id: null,
    };
  }
}
