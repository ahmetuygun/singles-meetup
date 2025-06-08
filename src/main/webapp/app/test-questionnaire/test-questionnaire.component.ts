import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from 'app/login/login.service';

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

  constructor(private http: HttpClient, private router: Router, private loginService: LoginService) {}

  ngOnInit(): void {
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
    // Save answers to localStorage
    localStorage.setItem('questionnaireAnswers', JSON.stringify(this.answers));
    console.info('Questionnaire answers saved:', this.answers);
    this.loginService.login();
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
} 