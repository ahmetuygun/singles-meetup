import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { FormatMediumDatePipe } from 'app/shared/date';
import { IPersonProfile } from '../person-profile.model';

@Component({
  selector: 'jhi-person-profile-detail',
  templateUrl: './person-profile-detail.component.html',
  imports: [SharedModule, RouterModule, FormatMediumDatePipe],
})
export class PersonProfileDetailComponent {
  personProfile = input<IPersonProfile | null>(null);

  previousState(): void {
    window.history.back();
  }
}
