import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, inject, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { LoginService } from 'app/login/login.service';
import { PersonProfileService } from 'app/entities/person-profile/service/person-profile.service';
import { AccountService } from 'app/core/auth/account.service';
import { COUNTRIES } from './countries';
import { JOBS } from './jobs';

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
  editable: boolean;
  options: TestAnswerOption[];
  answers: any[];
}

// DTOs for the new API
interface OptionDTO {
  id: number;
  optionText: string;
  value: number;
}

interface QuestionAnswerDTO {
  questionId: number;
  questionText: string;
  questionType: string;
  category: string;
  options: OptionDTO[];
  answerValue: any;
  editable: boolean;
}

interface QuestionnaireSubmissionDTO {
  questions: QuestionAnswerDTO[];
}

@Component({
  selector: 'app-test-questionnaire',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, NgbModule],
  templateUrl: './test-questionnaire.component.html',
})
export class TestQuestionnaireComponent implements OnInit, AfterViewInit {
  questions: TestQuestion[] = [];
  currentStep = 0;
  answers: any = {};
  testAlreadyCompleted = false;
  isSubmitting = false;
  countries = COUNTRIES;
  filteredCountries: string[] = [];
  filteredJobs: string[] = [];
  @ViewChild('retakeModal') retakeModal?: TemplateRef<any>;
  private retakeRequested = false;
  private modalService = inject(NgbModal);

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

  ngAfterViewInit(): void {
    console.log('ngAfterViewInit - retakeModal template ref:', this.retakeModal);
  }

  get currentQuestion(): TestQuestion | null {
    return this.questions[this.currentStep] || null;
  }

  getCurrentAnswer(num: number): boolean {
    if (!this.currentQuestion) {
      return false;
    }
    const isSelected = this.answers[this.currentQuestion.id] === num;
    // console.log(
    //   `Check: Is button ${num} selected for Question ID ${this.currentQuestion.id}?`,
    //   isSelected
    // );
    return isSelected;
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

    this.accountService.identity().subscribe(account => {
      if (account) {
        // Check if user has completed test before (either from initial load or retake scenario)
        this.personProfileService.getCurrentUserProfile().subscribe({
          next: (profileResponse) => {
            const profile = profileResponse.body;
            console.log('Submit - Profile testCompleted:', profile?.testCompleted);
            console.log('Submit - retakeRequested:', this.retakeRequested);
            
            if (profile?.testCompleted && !this.retakeRequested) {
              // Show Bootstrap modal for retake confirmation
              console.log('Showing retake modal');
              this.openRetakeModal();
            } else {
              // Save answers directly (either first time or confirmed retake)
              console.log('Saving answers directly with retake:', this.retakeRequested);
              this.saveAnswersDirectly(this.retakeRequested); // retake=true if retakeRequested
            }
          },
          error: (error) => {
            console.log('Submit - Error getting profile:', error);
            // If 404 (no profile exists) or any other error, proceed with saving answers
            // This is likely a new user who hasn't completed the questionnaire yet
            console.log('No existing profile found, saving answers directly');
            this.saveAnswersDirectly(false); // First time submission
          }
        });
      } else {
        // Store answers in new format for after login
        const submissionData = this.prepareSubmissionData();
        localStorage.setItem('questionnaireAnswers', JSON.stringify(submissionData));
        this.loginService.login();
      }
    });
  }

  private openRetakeModal(): void {
    if (this.retakeModal) {
      const modalRef = this.modalService.open(this.retakeModal, { centered: true });
      modalRef.result.then((result) => {
        console.log('Modal result:', result);
        if (result === 'retake') {
          this.retakeRequested = true;
          this.saveAnswersDirectly(true); // retake=true
        } else {
          this.isSubmitting = false; // Reset if cancelled
        }
      }).catch((error) => {
        console.log('Modal dismissed:', error);
        this.isSubmitting = false; // Reset if dismissed
      });
    }
  }

  private saveAnswersDirectly(retake: boolean = false): void {
    console.log('saveAnswersDirectly called with retake:', retake);
    
    // Prepare submission data with question details
    const submissionData = this.prepareSubmissionData();
    console.log('Submission data:', submissionData);
    
    // Use the new API endpoint
    const url = retake ? '/api/questionnaire-answers-v2?retake=true' : '/api/questionnaire-answers-v2';
    console.log('API URL:', url);
    
    this.http.post(url, submissionData).subscribe({
      next: (response) => {
        console.log('Questionnaire answers saved successfully:', response);
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

  private prepareSubmissionData(): QuestionnaireSubmissionDTO {
    const questionAnswers: QuestionAnswerDTO[] = [];
    
    // Only include questions that have answers
    for (const question of this.questions) {
      const answerValue = this.answers[question.id];
      if (answerValue !== undefined && answerValue !== null && answerValue !== '') {
        // Convert options to DTO format
        const optionDTOs: OptionDTO[] = question.options.map(option => ({
          id: option.id,
          optionText: option.optionText,
          value: option.value
        }));

        questionAnswers.push({
          questionId: question.id,
          questionText: question.questionText,
          questionType: question.questionType,
          category: question.category,
          options: optionDTOs,
          answerValue: answerValue,
          editable: question.editable
        });
      }
    }

    return { questions: questionAnswers };
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
    // Auto-navigate to next question after a short delay (except on last step)
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
    console.log('retakeTest called - setting flags');
    this.testAlreadyCompleted = false;
    this.retakeRequested = true; // Mark that user wants to retake
    console.log('testAlreadyCompleted:', this.testAlreadyCompleted);
    console.log('retakeRequested:', this.retakeRequested);
  }

  getFirstExtremeLabel(question: TestQuestion): string {
    // Find the option with value 1 (first extreme)
    const firstOption = question.options?.find(opt => opt.value === 1);
    return firstOption?.optionText || '';
  }

  getSecondExtremeLabel(question: TestQuestion): string {
    // Find the option with value 2 (second extreme)
    const secondOption = question.options?.find(opt => opt.value === 2);
    return secondOption?.optionText || '';
  }

  isNumberSelected(questionId: number, num: number): boolean {
    return this.answers[questionId] === num;
  }

  trackByNumber(index: number, num: number): number {
    return num;
  }

  onLocationInput(event: any): void {
    const value = event.target.value.toLowerCase();
    if (value.length > 0) {
      this.filteredCountries = this.countries
        .filter(country => country.toLowerCase().includes(value))
        .slice(0, 10); // Limit to 10 suggestions
    } else {
      this.filteredCountries = [];
    }
  }

  selectCountry(country: string): void {
    if (this.currentQuestion) {
      this.answers[this.currentQuestion.id] = country;
      this.filteredCountries = [];
      // Auto-navigate to next question after a short delay (except on last step)
      if (!this.isLastStep()) {
        setTimeout(() => this.next(), 300);
      }
    }
  }

  onCountryHover(event: Event, isEnter: boolean): void {
    const target = event.target as HTMLElement;
    if (target) {
      target.style.backgroundColor = isEnter ? '#f8f9fa' : 'white';
    }
  }

  onJobInput(event: any): void {
    const value = event.target.value;
    if (value && value.length > 0) {
      this.filteredJobs = JOBS.filter(job => 
        job.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 10); // Limit to 10 results
    } else {
      this.filteredJobs = [];
    }
  }

  selectJob(job: string): void {
    if (this.currentQuestion) {
      this.answers[this.currentQuestion.id] = job;
      this.filteredJobs = [];
      // Auto-navigate to next question after a short delay (except on last step)
      if (!this.isLastStep()) {
        setTimeout(() => this.next(), 300);
      }
    }
  }

  onJobHover(event: Event, isEnter: boolean): void {
    const target = event.target as HTMLElement;
    if (target) {
      target.style.backgroundColor = isEnter ? '#f8f9fa' : 'white';
    }
  }
} 