import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, finalize } from 'rxjs';

import SharedModule from 'app/shared/shared.module';
import { ITestQuestion, NewTestQuestion } from '../test-question.model';
import { ITestAnswerOption, NewTestAnswerOption } from '../../test-answer-option/test-answer-option.model';
import { TestQuestionService } from '../service/test-question.service';
import { TestAnswerOptionService } from '../../test-answer-option/service/test-answer-option.service';
import { QuestionType } from '../../enumerations/question-type.model';

@Component({
  selector: 'jhi-question-manager',
  templateUrl: './question-manager.component.html',
  imports: [CommonModule, SharedModule, FormsModule, ReactiveFormsModule],
})
export class QuestionManagerComponent implements OnInit {
  questions = signal<ITestQuestion[]>([]);
  isLoading = false;
  isSaving = false;
  
  editingQuestion: ITestQuestion | null = null;
  showEditForm = false;
  
  questionTypeValues = Object.keys(QuestionType);
  QuestionType = QuestionType;
  
  editForm: FormGroup;
  
  protected fb = inject(FormBuilder);
  protected testQuestionService = inject(TestQuestionService);
  protected testAnswerOptionService = inject(TestAnswerOptionService);
  protected router = inject(Router);

  constructor() {
    this.editForm = this.createQuestionForm();
  }

  ngOnInit(): void {
    this.loadQuestions();
  }

  loadQuestions(): void {
    this.isLoading = true;
    // Use the specific endpoint that loads questions with their options
    this.testQuestionService.queryWithOptions().subscribe({
      next: (response) => {
        const questions = response.body || [];
        // Sort by step number, then by ID for consistent ordering
        questions.sort((a, b) => {
          if (a.stepNumber && b.stepNumber) {
            return a.stepNumber - b.stepNumber;
          }
          if (a.stepNumber && !b.stepNumber) return -1;
          if (!a.stepNumber && b.stepNumber) return 1;
          return (a.id || 0) - (b.id || 0);
        });
        this.questions.set(questions);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  createQuestionForm(): FormGroup {
    return this.fb.group({
      id: [null],
      questionText: ['', [Validators.required]],
      questionType: ['', [Validators.required]],
      stepNumber: [null],
      isRequired: [false],
      category: [''],
      language: ['en', [Validators.required]],
      options: this.fb.array([])
    });
  }

  get optionsFormArray(): FormArray {
    return this.editForm.get('options') as FormArray;
  }

  createOptionForm(option?: ITestAnswerOption): FormGroup {
    return this.fb.group({
      id: [option?.id || null],
      optionText: [option?.optionText || '', [Validators.required]],
      value: [option?.value || null]
    });
  }

  addOption(): void {
    this.optionsFormArray.push(this.createOptionForm());
  }

  removeOption(index: number): void {
    // Don't allow removing if only 2 options remain for choice questions
    if (this.optionsFormArray.length <= 2) {
      return;
    }
    
    console.log('Removing option at index:', index);
    this.optionsFormArray.removeAt(index);
  }

  needsOptions(questionType: string): boolean {
    return questionType === 'SINGLE_CHOICE' || questionType === 'MULTIPLE_CHOICE';
  }

  onQuestionTypeChange(): void {
    const questionType = this.editForm.get('questionType')?.value;
    
    if (this.needsOptions(questionType)) {
      if (this.optionsFormArray.length === 0) {
        this.addOption();
        this.addOption(); // Add at least 2 options for choice questions
      }
    } else {
      // Clear options for non-choice questions
      while (this.optionsFormArray.length > 0) {
        this.optionsFormArray.removeAt(0);
      }
    }
  }

  startEdit(question?: ITestQuestion): void {
    this.editingQuestion = question || null;
    this.showEditForm = true;
    
    if (question) {
      this.editForm.patchValue({
        id: question.id,
        questionText: question.questionText,
        questionType: question.questionType,
        stepNumber: question.stepNumber,
        isRequired: question.isRequired,
        category: question.category,
        language: question.language || 'en'
      });
      
      // Clear existing options
      while (this.optionsFormArray.length > 0) {
        this.optionsFormArray.removeAt(0);
      }
      
      // Load options for this question if they exist
      if (this.needsOptions(question.questionType || '') && question.options) {
        question.options.forEach((option: ITestAnswerOption) => {
          this.optionsFormArray.push(this.createOptionForm(option));
        });
      }
    } else {
      this.editForm.reset();
      this.editForm.patchValue({
        isRequired: false,
        language: 'en'
      });
      while (this.optionsFormArray.length > 0) {
        this.optionsFormArray.removeAt(0);
      }
    }
    
    // Trigger question type change to set up initial options if needed
    setTimeout(() => this.onQuestionTypeChange(), 0);
  }

  cancelEdit(): void {
    this.showEditForm = false;
    this.editingQuestion = null;
    this.editForm.reset();
  }

  save(): void {
    if (this.editForm.invalid) {
      return;
    }
    
    this.isSaving = true;
    const formValue = this.editForm.value;
    
    const question: ITestQuestion = {
      id: formValue.id,
      questionText: formValue.questionText,
      questionType: formValue.questionType,
      stepNumber: formValue.stepNumber,
      isRequired: formValue.isRequired,
      category: formValue.category,
      language: formValue.language
    };

    // Handle options for choice-type questions
    if (this.needsOptions(question.questionType || '') && formValue.options && formValue.options.length > 0) {
      const validOptions = formValue.options
        .filter((opt: any) => opt.optionText && opt.optionText.trim() !== '')
        .map((opt: any) => ({
          id: opt.id && opt.id > 0 ? opt.id : null,
          optionText: opt.optionText,
          value: opt.value
        }));
      
      console.log('Sending options:', validOptions);
      question.options = validOptions;
    } else {
      console.log('No options needed or provided, sending empty array');
      question.options = [];
    }

    console.log('Saving question with options:', question);

    const saveOperation = question.id 
      ? this.testQuestionService.update(question)
      : this.testQuestionService.create({ ...question, id: null } as NewTestQuestion);

    saveOperation.pipe(finalize(() => this.isSaving = false)).subscribe({
      next: () => {
        console.log('Question saved successfully');
        this.onSaveSuccess();
      },
      error: (error) => {
        console.error('Failed to save question:', error);
      }
    });
  }

  onSaveSuccess(): void {
    this.showEditForm = false;
    this.editingQuestion = null;
    this.loadQuestions(); // Reload questions list
  }

  deleteQuestion(question: ITestQuestion): void {
    if (confirm(`Are you sure you want to delete the question: "${question.questionText}"?`)) {
      this.testQuestionService.delete(question.id).subscribe({
        next: () => {
          this.loadQuestions();
        },
        error: (error) => {
          console.error('Failed to delete question:', error);
        }
      });
    }
  }

  getQuestionTypeLabel(type: string): string {
    switch (type) {
      case 'SINGLE_CHOICE': return 'Single Choice';
      case 'MULTIPLE_CHOICE': return 'Multiple Choice';
      case 'TEXT_INPUT': return 'Text Input';
      case 'NUMBER_INPUT': return 'Number Input';
      case 'DATE_INPUT': return 'Date Input';
      case 'AUTOCOMPLETE_INPUT': return 'Autocomplete';
      default: return type;
    }
  }
} 