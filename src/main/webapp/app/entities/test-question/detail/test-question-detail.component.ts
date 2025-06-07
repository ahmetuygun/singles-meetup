import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { ITestQuestion } from '../test-question.model';

@Component({
  selector: 'jhi-test-question-detail',
  templateUrl: './test-question-detail.component.html',
  imports: [SharedModule, RouterModule],
})
export class TestQuestionDetailComponent {
  testQuestion = input<ITestQuestion | null>(null);

  previousState(): void {
    window.history.back();
  }
}
