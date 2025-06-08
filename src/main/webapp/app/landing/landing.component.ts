import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from 'app/login/login.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  templateUrl: './landing.component.html',
})
export class LandingComponent {
  constructor(private router: Router, private loginService: LoginService) {}

  goToTest(): void {
    this.router.navigate(['/questionnaire']);
  }

  goToLogin(): void {
    this.loginService.login();
  }
} 