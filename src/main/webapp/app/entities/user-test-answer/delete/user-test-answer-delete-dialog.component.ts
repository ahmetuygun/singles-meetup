import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IUserTestAnswer } from '../user-test-answer.model';
import { UserTestAnswerService } from '../service/user-test-answer.service';

@Component({
  templateUrl: './user-test-answer-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class UserTestAnswerDeleteDialogComponent {
  userTestAnswer?: IUserTestAnswer;

  protected userTestAnswerService = inject(UserTestAnswerService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.userTestAnswerService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
