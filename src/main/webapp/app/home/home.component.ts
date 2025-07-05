import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { RouterModule, Router } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { LoginService } from 'app/login/login.service';
import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/auth/account.model';
import {EventComponent} from "../entities/event/list/event.component";
import FaqComponent from "../faq/faq.component";
import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'jhi-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [SharedModule, RouterModule, EventComponent, FaqComponent],
})
export default class HomeComponent implements OnInit, OnDestroy {
  account = signal<Account | null>(null);
  faMapMarkerAlt = faMapMarkerAlt;

  private readonly accountService = inject(AccountService);
  private readonly loginService = inject(LoginService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.accountService.identity().subscribe(account => this.account.set(account));
  }

  ngOnDestroy(): void {
    // Clean up any remaining event listeners if needed
  }

  login(): void {
    this.loginService.login();
  }

  goToLanding(): void {
    this.router.navigate(['/landing']);
  }

  scrollToEvents(): void {
    const eventsSection = document.getElementById('events-section');
    if (eventsSection) {
      eventsSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }
}
