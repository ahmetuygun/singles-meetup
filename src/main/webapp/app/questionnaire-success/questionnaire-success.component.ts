import { Component, OnInit, AfterViewInit, ViewChild, TemplateRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AccountService } from 'app/core/auth/account.service';
import { PersonProfileService } from 'app/entities/person-profile/service/person-profile.service';

// DTOs for the new API (matching the test-questionnaire component)
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
  selector: 'app-questionnaire-success',
  standalone: true,
  imports: [CommonModule, HttpClientModule, NgbModule],
  templateUrl: './questionnaire-success.component.html',
})
export class QuestionnaireSuccessComponent implements OnInit, AfterViewInit {
  isProcessing = true;
  isSuccess = false;
  hasAnswers = false;
  errorMessage = '';
  @ViewChild('retakeModal') retakeModal?: TemplateRef<any>;
  private modalService = inject(NgbModal);
  private retakeRequested = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private accountService: AccountService,
    private personProfileService: PersonProfileService
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

  ngAfterViewInit(): void {
    // Any initialization after view is ready
  }

  private processQuestionnaireAnswers(): void {
    const savedAnswers = localStorage.getItem('questionnaireAnswers');
    
    if (!savedAnswers) {
      this.hasAnswers = false;
      this.isProcessing = false;
      // If no saved answers, assume they were already processed (direct submission)
      // Show success state instead of redirecting
      this.isSuccess = true;
      return;
    }

    this.hasAnswers = true;

    try {
      const submissionData: QuestionnaireSubmissionDTO = JSON.parse(savedAnswers);
      console.info('Processing questionnaire submission after login:', submissionData);
      
      // First, check if user has already completed the test
      this.personProfileService.getCurrentUserProfile().subscribe({
        next: (profileResponse) => {
          const profile = profileResponse.body;
          console.log('Profile testCompleted:', profile?.testCompleted);
          console.log('retakeRequested:', this.retakeRequested);
          
          if (profile?.testCompleted && !this.retakeRequested) {
            // Test already completed, show modal instead of making API call
            console.log('Test already completed, showing retake modal');
            this.isProcessing = false;
            this.openRetakeModal();
          } else {
            // Safe to make API call
            this.saveSubmissionToAPI(submissionData);
          }
        },
        error: (error) => {
          console.error('Error checking profile:', error);
          // If we can't check profile, try to save anyway
          this.saveSubmissionToAPI(submissionData);
        }
      });
      
    } catch (error) {
      console.error('Error parsing questionnaire submission:', error);
      localStorage.removeItem('questionnaireAnswers'); // Clean up invalid data
      this.errorMessage = 'There was an issue with your saved responses.';
      this.isProcessing = false;
    }
  }

  private saveSubmissionToAPI(submissionData: QuestionnaireSubmissionDTO): void {
    const url = this.retakeRequested ? '/api/questionnaire-answers-v2?retake=true' : '/api/questionnaire-answers-v2';
    console.log('Making API call to:', url);
    
    this.http.post(url, submissionData).subscribe({
      next: (response) => {
        console.info('Questionnaire submission saved successfully:', response);
        localStorage.removeItem('questionnaireAnswers'); // Clean up after successful save
        this.isSuccess = true;
        this.isProcessing = false;
      },
      error: (error) => {
        console.error('Failed to save questionnaire submission:', error);
        this.errorMessage = 'We encountered an issue saving your responses. Please try again later.';
        this.isProcessing = false;
        // Keep answers in localStorage for retry
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
          this.isProcessing = true;
          // Get the saved answers and process them with retake=true
          const savedAnswers = localStorage.getItem('questionnaireAnswers');
          if (savedAnswers) {
            try {
              const submissionData: QuestionnaireSubmissionDTO = JSON.parse(savedAnswers);
              this.saveSubmissionToAPI(submissionData);
            } catch (error) {
              console.error('Error parsing saved answers for retake:', error);
              this.errorMessage = 'There was an issue processing your retake request.';
              this.isProcessing = false;
            }
          }
        }
        // If cancelled, just stay on the page
      }).catch((error) => {
        console.log('Modal dismissed:', error);
        // If dismissed, just stay on the page
      });
    }
  }

  retryProcessing(): void {
    this.isProcessing = true;
    this.errorMessage = '';
    this.processQuestionnaireAnswers();
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
} 