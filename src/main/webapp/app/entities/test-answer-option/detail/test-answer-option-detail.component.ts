import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { ITestAnswerOption } from '../test-answer-option.model';

@Component({
  selector: 'jhi-test-answer-option-detail',
  templateUrl: './test-answer-option-detail.component.html',
  imports: [SharedModule, RouterModule],
})
export class TestAnswerOptionDetailComponent {
  testAnswerOption = input<ITestAnswerOption | null>(null);

  previousState(): void {
    window.history.back();
  }
}
