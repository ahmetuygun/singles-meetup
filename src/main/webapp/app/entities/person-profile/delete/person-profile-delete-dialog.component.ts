import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IPersonProfile } from '../person-profile.model';
import { PersonProfileService } from '../service/person-profile.service';

@Component({
  templateUrl: './person-profile-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class PersonProfileDeleteDialogComponent {
  personProfile?: IPersonProfile;

  protected personProfileService = inject(PersonProfileService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.personProfileService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
