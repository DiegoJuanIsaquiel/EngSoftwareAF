import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AtividadeService } from 'src/app/core/services/atividade.service';
import { AuthService } from 'src/app/core/services/auth.service';

/* #region Interfaces */

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctOption: number;
  explanation?: string;
}

export interface Quiz {
  atividadeId: string;
  questions: Question[];
}

/* #endregion */

/* #region Strategy Pattern - Scoring */

interface ScoringStrategy {
  calculateScore(quiz: Quiz, submittedAnswers: Record<string, number>): ScoreResult;
}

interface ScoreResult {
  correctCount: number;
  percentage: number;
}

class SimplePercentageScoring implements ScoringStrategy {
  calculateScore(quiz: Quiz, submittedAnswers: Record<string, number>): ScoreResult {
    let correctCount = 0;

    quiz.questions.forEach((question) => {
      if (submittedAnswers[question.id] === question.correctOption) {
        correctCount++;
      }
    });

    const percentage = Math.round((correctCount / quiz.questions.length) * 100);

    return { correctCount, percentage };
  }
}

/* #endregion */

@Component({
  selector: 'app-quiz-component',
  templateUrl: './quiz-component.component.html',
  styleUrls: ['./quiz-component.component.scss']
})
export class QuizComponent implements OnInit {

  /* #region Inputs and Outputs */

  @Input() quiz!: Quiz;
  @Input() completed: boolean = false;
  @Input() courseId!: string;
  @Output() onComplete: EventEmitter<boolean> = new EventEmitter<boolean>();

  /* #endregion */

  /* #region Properties */

  public currentQuestionIndex: number = 0;
  public selectedOptions: Record<string, number> = {};
  public submittedAnswers: Record<string, number> = {};
  public showResults: boolean = false;

  private scoringStrategy: ScoringStrategy = new SimplePercentageScoring();

  /* #endregion */

  /* #region Lifecycle */

  constructor(
    private atividadeService: AtividadeService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Inicialização adicional se necessário
  }

  /* #endregion */

  /* #region Getters */

  get currentQuestion(): Question {
    return this.quiz.questions[this.currentQuestionIndex];
  }

  get totalQuestions(): number {
    return this.quiz.questions.length;
  }

  /* #endregion */

  /* #region Event Handlers */

  public handleOptionSelect(optionIndex: number): void {
    this.selectedOptions[this.currentQuestion.id] = optionIndex;
  }

  public handleSubmitAnswer(): void {
    const selectedOption: number | undefined = this.selectedOptions[this.currentQuestion.id];
    if (selectedOption === undefined) return;

    this.submittedAnswers[this.currentQuestion.id] = selectedOption;

    const isLastQuestion: boolean = this.currentQuestionIndex === this.totalQuestions - 1;

    if (isLastQuestion) {
      this.sendQuizResults();
      this.showResults = true;
    } else {
      this.currentQuestionIndex++;
    }
  }

  public async handleReviewQuestion(userAnswer: Question): Promise<void> {
    const currentQuestion: Question | undefined = this.quiz.questions.find(q => q.id === userAnswer.id);

    if (!currentQuestion) {
      console.error('Questão atual não encontrada');
      return;
    }

    try {
      const response: any = await firstValueFrom(
        this.atividadeService.corrigirComInteligenciaArtificial(
          this.quiz.atividadeId,
          this.authService.getCurrentUserSub() || '',
          this.courseId,
          currentQuestion.id
        )
      );

      currentQuestion.explanation = response.correcaoIA ?? 'Sem explicação retornada.';
      console.log(`Explicação recebida para questão ${currentQuestion.id}:`, currentQuestion.explanation);
    } catch (error) {
      console.error('Erro ao buscar explicação da IA:', error);
      currentQuestion.explanation = 'Ocorreu um erro ao buscar explicação.';
    }
  }

  public handleFinishQuiz(): void {
    const score: ScoreResult = this.scoringStrategy.calculateScore(this.quiz, this.submittedAnswers);
    this.onComplete.emit(score.percentage >= 70);
  }

  /* #endregion */

  /* #region Business Logic */

  private sendQuizResults(): void {
    const respostas: Record<string, string> = {};

    Object.keys(this.submittedAnswers).forEach((questionId: string) => {
      respostas[questionId] = this.submittedAnswers[questionId].toString();
    });

    const payload = {
      atividadeId: this.quiz.atividadeId,
      respostas: respostas
    };

    console.log('Enviando payload de gabarito:', payload);

    this.atividadeService.enviarAtividade(payload).subscribe({
      next: (response: any) => console.log('Gabarito enviado com sucesso:', response),
      error: (error: any) => console.error('Erro ao enviar gabarito:', error)
    });
  }

  public isCorrect(question: Question): boolean {
    return this.submittedAnswers[question.id] === question.correctOption;
  }

  /* #endregion */
}
