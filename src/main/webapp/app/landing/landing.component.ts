import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  templateUrl: './landing.component.html',
})
export class LandingComponent {
  constructor(private router: Router) {}

  goToTest(): void {
    this.router.navigate(['/questionnaire']);
  }
} 