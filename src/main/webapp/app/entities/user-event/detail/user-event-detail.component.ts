import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { IUserEvent } from '../user-event.model';

@Component({
  selector: 'jhi-user-event-detail',
  templateUrl: './user-event-detail.component.html',
  imports: [SharedModule, RouterModule],
})
export class UserEventDetailComponent {
  userEvent = input<IUserEvent | null>(null);

  previousState(): void {
    window.history.back();
  }
}
