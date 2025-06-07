import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { FormatMediumDatetimePipe } from 'app/shared/date';
import { IUserTestAnswer } from '../user-test-answer.model';

@Component({
  selector: 'jhi-user-test-answer-detail',
  templateUrl: './user-test-answer-detail.component.html',
  imports: [SharedModule, RouterModule, FormatMediumDatetimePipe],
})
export class UserTestAnswerDetailComponent {
  userTestAnswer = input<IUserTestAnswer | null>(null);

  previousState(): void {
    window.history.back();
  }
}
