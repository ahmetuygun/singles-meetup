import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { AccountService } from 'app/core/auth/account.service';

@Component({
  selector: 'app-questionnaire-success',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './questionnaire-success.component.html',
})
export class QuestionnaireSuccessComponent implements OnInit {
  isProcessing = true;
  isSuccess = false;
  hasAnswers = false;
  errorMessage = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private accountService: AccountService
  ) {}

  ngOnInit(): void {
    // Check if user is authenticated
    this.accountService.identity().subscribe(account => {
      if (account) {
        this.processQuestionnaireAnswers();
      } else {
        // If not authenticated, redirect to home
        this.router.navigate(['/']);
      }
    });
  }

  private processQuestionnaireAnswers(): void {
    const savedAnswers = localStorage.getItem('questionnaireAnswers');
    
    if (!savedAnswers) {
      this.hasAnswers = false;
      this.isProcessing = false;
      // Redirect to homepage if no questionnaire answers found
      this.router.navigate(['/']);
      return;
    }

    this.hasAnswers = true;

    try {
      const answers = JSON.parse(savedAnswers);
      console.info('Processing questionnaire answers after login:', answers);
      
      // Send answers to backend API
      this.http.post('/api/questionnaire-answers', answers).subscribe({
        next: (response) => {
          console.info('Questionnaire answers saved successfully:', response);
          localStorage.removeItem('questionnaireAnswers'); // Clean up after successful save
          this.isSuccess = true;
          this.isProcessing = false;
        },
        error: (error) => {
          console.error('Failed to save questionnaire answers:', error);
          this.errorMessage = 'We encountered an issue saving your responses. Please try again later.';
          this.isProcessing = false;
          // Keep answers in localStorage for retry
        }
      });
      
    } catch (error) {
      console.error('Error parsing questionnaire answers:', error);
      localStorage.removeItem('questionnaireAnswers'); // Clean up invalid data
      this.errorMessage = 'There was an issue with your saved responses.';
      this.isProcessing = false;
    }
  }

  viewEvents(): void {
    this.router.navigate(['/']);
  }

  retryProcessing(): void {
    this.isProcessing = true;
    this.errorMessage = '';
    this.processQuestionnaireAnswers();
  }
} 