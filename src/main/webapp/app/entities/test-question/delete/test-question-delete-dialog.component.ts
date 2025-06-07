import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { ITestQuestion } from '../test-question.model';
import { TestQuestionService } from '../service/test-question.service';

@Component({
  templateUrl: './test-question-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class TestQuestionDeleteDialogComponent {
  testQuestion?: ITestQuestion;

  protected testQuestionService = inject(TestQuestionService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.testQuestionService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
