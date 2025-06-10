import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgIf } from '@angular/common';
import { TranslateDirective } from 'app/shared/language';
import { AccountService } from 'app/core/auth/account.service';

@Component({
  selector: 'jhi-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  imports: [TranslateDirective, RouterModule, NgIf],
})
export default class FooterComponent {
  currentYear = new Date().getFullYear();
  
  private accountService = inject(AccountService);

  isAuthenticated(): boolean {
    return this.accountService.isAuthenticated();
  }

  get account() {
    return this.accountService.trackCurrentAccount()();
  }

  scrollToHowItWorks(): void {
    const element = document.querySelector('.info-boxes-wrapper');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  scrollToEvents(): void {
    const element = document.getElementById('events-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
