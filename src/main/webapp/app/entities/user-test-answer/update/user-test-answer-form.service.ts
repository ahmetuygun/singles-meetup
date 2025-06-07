import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IUserTestAnswer, NewUserTestAnswer } from '../user-test-answer.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IUserTestAnswer for edit and NewUserTestAnswerFormGroupInput for create.
 */
type UserTestAnswerFormGroupInput = IUserTestAnswer | PartialWithRequiredKeyOf<NewUserTestAnswer>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IUserTestAnswer | NewUserTestAnswer> = Omit<T, 'timestamp'> & {
  timestamp?: string | null;
};

type UserTestAnswerFormRawValue = FormValueOf<IUserTestAnswer>;

type NewUserTestAnswerFormRawValue = FormValueOf<NewUserTestAnswer>;

type UserTestAnswerFormDefaults = Pick<NewUserTestAnswer, 'id' | 'timestamp'>;

type UserTestAnswerFormGroupContent = {
  id: FormControl<UserTestAnswerFormRawValue['id'] | NewUserTestAnswer['id']>;
  answerValue: FormControl<UserTestAnswerFormRawValue['answerValue']>;
  timestamp: FormControl<UserTestAnswerFormRawValue['timestamp']>;
  question: FormControl<UserTestAnswerFormRawValue['question']>;
  personProfile: FormControl<UserTestAnswerFormRawValue['personProfile']>;
  answer: FormControl<UserTestAnswerFormRawValue['answer']>;
};

export type UserTestAnswerFormGroup = FormGroup<UserTestAnswerFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class UserTestAnswerFormService {
  createUserTestAnswerFormGroup(userTestAnswer: UserTestAnswerFormGroupInput = { id: null }): UserTestAnswerFormGroup {
    const userTestAnswerRawValue = this.convertUserTestAnswerToUserTestAnswerRawValue({
      ...this.getFormDefaults(),
      ...userTestAnswer,
    });
    return new FormGroup<UserTestAnswerFormGroupContent>({
      id: new FormControl(
        { value: userTestAnswerRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      answerValue: new FormControl(userTestAnswerRawValue.answerValue, {
        validators: [Validators.required],
      }),
      timestamp: new FormControl(userTestAnswerRawValue.timestamp),
      question: new FormControl(userTestAnswerRawValue.question),
      personProfile: new FormControl(userTestAnswerRawValue.personProfile),
      answer: new FormControl(userTestAnswerRawValue.answer),
    });
  }

  getUserTestAnswer(form: UserTestAnswerFormGroup): IUserTestAnswer | NewUserTestAnswer {
    return this.convertUserTestAnswerRawValueToUserTestAnswer(
      form.getRawValue() as UserTestAnswerFormRawValue | NewUserTestAnswerFormRawValue,
    );
  }

  resetForm(form: UserTestAnswerFormGroup, userTestAnswer: UserTestAnswerFormGroupInput): void {
    const userTestAnswerRawValue = this.convertUserTestAnswerToUserTestAnswerRawValue({ ...this.getFormDefaults(), ...userTestAnswer });
    form.reset(
      {
        ...userTestAnswerRawValue,
        id: { value: userTestAnswerRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): UserTestAnswerFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      timestamp: currentTime,
    };
  }

  private convertUserTestAnswerRawValueToUserTestAnswer(
    rawUserTestAnswer: UserTestAnswerFormRawValue | NewUserTestAnswerFormRawValue,
  ): IUserTestAnswer | NewUserTestAnswer {
    return {
      ...rawUserTestAnswer,
      timestamp: dayjs(rawUserTestAnswer.timestamp, DATE_TIME_FORMAT),
    };
  }

  private convertUserTestAnswerToUserTestAnswerRawValue(
    userTestAnswer: IUserTestAnswer | (Partial<NewUserTestAnswer> & UserTestAnswerFormDefaults),
  ): UserTestAnswerFormRawValue | PartialWithRequiredKeyOf<NewUserTestAnswerFormRawValue> {
    return {
      ...userTestAnswer,
      timestamp: userTestAnswer.timestamp ? userTestAnswer.timestamp.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
