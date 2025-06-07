import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { ITestAnswerOption } from '../test-answer-option.model';
import { TestAnswerOptionService } from '../service/test-answer-option.service';

@Component({
  templateUrl: './test-answer-option-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class TestAnswerOptionDeleteDialogComponent {
  testAnswerOption?: ITestAnswerOption;

  protected testAnswerOptionService = inject(TestAnswerOptionService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.testAnswerOptionService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
