import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from 'app/login/login.service';
import { PersonProfileService } from 'app/entities/person-profile/service/person-profile.service';
import { AccountService } from 'app/core/auth/account.service';

interface TestAnswerOption {
  id: number;
  optionText: string;
  value: number;
}

interface TestQuestion {
  id: number;
  questionText: string;
  questionType: string;
  stepNumber: number;
  isRequired: boolean;
  category: string;
  language: string;
  options: TestAnswerOption[];
}

@Component({
  selector: 'app-test-questionnaire',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './test-questionnaire.component.html',
})
export class TestQuestionnaireComponent implements OnInit {
  questions: TestQuestion[] = [];
  currentStep = 0;
  answers: any = {};
  testAlreadyCompleted = false;
  isSubmitting = false;

  constructor(
    private http: HttpClient, 
    private router: Router, 
    private loginService: LoginService,
    private personProfileService: PersonProfileService,
    private accountService: AccountService
  ) {}

  ngOnInit(): void {
    // Check if user is authenticated and has already completed the test
    this.accountService.identity().subscribe(account => {
      if (account) {
        this.personProfileService.getCurrentUserProfile().subscribe(profileResponse => {
          const profile = profileResponse.body;
          if (profile?.testCompleted) {
            this.testAlreadyCompleted = true;
          }
        });
      }
    });

    this.http.get<TestQuestion[]>('/api/test-questions/with-options').subscribe(data => {
      this.questions = data.sort((a, b) => a.stepNumber - b.stepNumber);
    });
  }

  get currentQuestion(): TestQuestion | undefined {
    return this.questions[this.currentStep];
  }

  next() {
    if (this.currentStep < this.questions.length - 1) this.currentStep++;
  }

  prev() {
    if (this.currentStep > 0) this.currentStep--;
  }

  isLastStep() {
    return this.currentStep === this.questions.length - 1;
  }

  submit() {
    if (this.isSubmitting) return; // Prevent multiple submissions
    
    this.isSubmitting = true;
    
    // Check if user is already authenticated
    this.accountService.identity().subscribe(account => {
      if (account) {
        // User is authenticated, save answers directly
        console.info('User is authenticated, saving questionnaire answers directly:', this.answers);
        this.saveAnswersDirectly();
      } else {
        // User is not authenticated, save to localStorage and redirect to login
        localStorage.setItem('questionnaireAnswers', JSON.stringify(this.answers));
        console.info('User not authenticated, saving to localStorage and redirecting to login:', this.answers);
        this.loginService.login();
      }
    });
  }

  private saveAnswersDirectly(): void {
    // Send answers directly to backend API
    this.http.post('/api/questionnaire-answers', this.answers).subscribe({
      next: (response) => {
        console.info('Questionnaire answers saved successfully:', response);
        this.isSubmitting = false;
        // Redirect to questionnaire success page
        this.router.navigate(['/questionnaire-success']);
      },
      error: (error) => {
        console.error('Failed to save questionnaire answers:', error);
        this.isSubmitting = false;
        // Handle error - could show an error message
        alert('There was an error saving your responses. Please try again.');
      }
    });
  }

  toggleMultiChoice(questionId: number, value: number): void {
    if (!this.answers[questionId]) {
      this.answers[questionId] = [];
    }
    const idx = this.answers[questionId].indexOf(value);
    if (idx > -1) {
      this.answers[questionId].splice(idx, 1);
    } else {
      this.answers[questionId].push(value);
    }
  }

  isAnswered(question: TestQuestion): boolean {
    const ans = this.answers[question.id];
    if (question.questionType === 'MULTIPLE_CHOICE') {
      return Array.isArray(ans) && ans.length > 0;
    }
    return ans !== undefined && ans !== null && ans !== '';
  }

  formatQuestionText(text: string): string {
    return text.replace(/_(.*?)_/g, '<em>$1</em>');
  }

  selectSingleChoice(questionId: number, value: number): void {
    this.answers[questionId] = value;
    if (!this.isLastStep()) {
      setTimeout(() => this.next(), 300);
    }
  }

  selectMultiChoice(questionId: number, value: number): void {
    this.toggleMultiChoice(questionId, value);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  retakeTest(): void {
    this.testAlreadyCompleted = false;
  }
} 