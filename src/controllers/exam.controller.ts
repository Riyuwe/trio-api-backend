/* eslint-disable @typescript-eslint/no-explicit-any */
import {authenticate, TokenService} from '@loopback/authentication';
import {TokenServiceBindings} from '@loopback/authentication-jwt';
import {authorize} from '@loopback/authorization';
import {inject} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  HttpErrors,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {Exam} from '../models';
import {
  ExamRepository,
  MyExamRepository,
  SubmitExamData,
  UserRepository,
} from '../repositories';
import {basicAuthorization} from '../services';
import {OPERATION_SECURITY_SPEC} from './../utils/security-specs';
import {SubmitExamRequestBody} from './specs/exam-controller.specs';

export class ExamController {
  constructor(
    // repositories
    @repository(ExamRepository)
    public examRepository: ExamRepository,
    @repository(MyExamRepository)
    public myExamRepository: MyExamRepository,
    @repository(UserRepository)
    public userRepository: UserRepository,
    // services
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
  ) {}

  @post('/exams', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Exam model instance',
        content: {'application/json': {schema: getModelSchemaRef(Exam)}},
      },
    },
  })
  @authenticate('jwt')
  @authorize({
    allowedRoles: ['admin', 'support'],
    voters: [basicAuthorization],
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Exam, {
            title: 'NewExam',
            exclude: ['id'],
          }),
        },
      },
    })
    exam: Omit<Exam, 'id'>,
  ): Promise<Exam> {
    return this.examRepository.create(exam);
  }

  @get('/exams/count')
  @response(200, {
    description: 'Exam model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Exam) where?: Where<Exam>): Promise<Count> {
    return this.examRepository.count(where);
  }

  @get('/exams', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Array of Exam model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Exam, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  @authenticate('jwt')
  async find(@param.filter(Exam) filter?: Filter<Exam>): Promise<Exam[]> {
    return this.examRepository.find(filter);
  }

  @patch('/exams', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Exam PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  @authenticate('jwt')
  @authorize({
    allowedRoles: ['admin', 'support'],
    voters: [basicAuthorization],
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Exam, {partial: true}),
        },
      },
    })
    exam: Exam,
    @param.where(Exam) where?: Where<Exam>,
  ): Promise<Count> {
    return this.examRepository.updateAll(exam, where);
  }

  @get('/exams/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Exam model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Exam, {includeRelations: true}),
          },
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({
    allowedRoles: ['admin', 'support'],
    voters: [basicAuthorization],
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Exam) filter?: FilterExcludingWhere<Exam>,
  ): Promise<Exam> {
    return this.examRepository.findById(id, filter);
  }

  @patch('/exams/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Exam PATCH success',
      },
    },
  })
  @authenticate('jwt')
  @authorize({
    allowedRoles: ['admin', 'support'],
    voters: [basicAuthorization],
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Exam, {partial: true}),
        },
      },
    })
    exam: Exam,
  ): Promise<void> {
    await this.examRepository.updateById(id, exam);
  }

  @put('/exams/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Exam PUT success',
      },
    },
  })
  @authenticate('jwt')
  @authorize({
    allowedRoles: ['admin', 'support'],
    voters: [basicAuthorization],
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() exam: Exam,
  ): Promise<void> {
    await this.examRepository.replaceById(id, exam);
  }

  @del('/exams/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Exam DELETE success',
      },
    },
  })
  @authenticate('jwt')
  @authorize({
    allowedRoles: ['admin', 'support'],
    voters: [basicAuthorization],
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.examRepository.deleteById(id);
  }

  /**
   * Submit Exam
   */
  @post('/exams/submit-exam', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Submit Exam',
        content: {
          'application/json': {
            schema: SubmitExamRequestBody,
          },
        },
      },
    },
  })
  @authenticate('jwt')
  async submitExam(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
    @requestBody(SubmitExamRequestBody)
    body: SubmitExamData,
  ): Promise<any> {
    try {
      const {examId, questions} = body;
      const userId = currentUserProfile[securityId];

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new HttpErrors.NotFound('User account not found');
      }
      const exam = await this.examRepository.findById(examId);
      if (!exam) {
        throw new Error('Exam not found');
      }

      if (
        exam.type !== 'MULTIPLE_CHOICE' &&
        exam.type !== 'ESSAY_AND_MULTIPLE_CHOICE'
      ) {
        throw new Error('Exam has no quiz included');
      }

      const myExam = await this.myExamRepository.findOne({
        where: {
          examId: examId,
          userId: userId,
        },
      });

      if (!myExam) {
        throw new Error('Not allowed to take the Exam');
      }
      if (!myExam.permissionGranted) {
        throw new Error('Pending admin permission');
      }
      if (myExam.quizCompleted) {
        throw new Error('Quiz already completed');
      }

      /**
       * Validate question answers
       */
      const allQuestions: any = exam.quiz;
      let correctAnswers = 0;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      questions.forEach((question: any) => {
        // find user selected answer
        const selectedAnswer = question.answers.find(
          (answer: any) => answer.selected === true,
        );
        if (!selectedAnswer) return;

        // find question from db
        let realQuestionIndex = -1;
        const realQuestion = allQuestions.find((q: any, index: number) => {
          if (question.name === q.name) {
            realQuestionIndex = index;
            return true;
          }
          return false;
        });
        if (!realQuestion) return;

        // find correct answer
        const correctAnswer = realQuestion.answers.find(
          (answer: any) => answer.correct === true,
        );
        if (!correctAnswer) return;

        // check if selected answer is correct
        if (selectedAnswer.name === correctAnswer.name) {
          question.correct = true;
          selectedAnswer.correct = true;
          correctAnswers++;
        }
        // delete realQuestion from array for faster future searches
        allQuestions.splice(realQuestionIndex, 1);
      });

      await this.myExamRepository.updateById(myExam.id, {
        quizCorrectAnswers: correctAnswers,
        quizLength: exam.quizLength,
        quizCompletedDate: new Date(),
        quizCompleted: true,
      });

      return {
        quizCorrectAnswers: correctAnswers,
        quizLength: exam.quizLength,
        quiz: questions,
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Get exam quiz
   */
  @get('/exams/get-exam-quiz/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Get exam quiz',
      },
    },
  })
  @authenticate('jwt')
  async getExamQuiz(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
    @param.path.string('id') id: string,
  ): Promise<Exam> {
    try {
      const userId = currentUserProfile[securityId];

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new HttpErrors.NotFound('User account not found');
      }
      const exam: any = await this.examRepository.findById(id);
      if (!exam) {
        throw new Error('Exam not found');
      }

      if (
        exam.type !== 'MULTIPLE_CHOICE' &&
        exam.type !== 'ESSAY_AND_MULTIPLE_CHOICE'
      ) {
        throw new Error('Exam has no quiz included');
      }

      const myExam = await this.myExamRepository.findOne({
        where: {
          examId: exam.id,
          userId: userId,
        },
      });
      if (!myExam) {
        throw new Error('Not allowed to take the Exam');
      }
      if (!myExam.permissionGranted) {
        throw new Error('Pending admin permission');
      }
      if (myExam.quizCompleted) {
        throw new Error('Quiz already completed');
      }

      // Randomize questions
      exam.quiz.sort(() => 0.5 - Math.random());

      // Limit the number of questions
      if (exam.quizLength) {
        exam.quiz = exam.quiz.splice(0, exam.quizLength);
      }

      // Remove correct answers data from json
      exam.quiz.forEach((q: any) => {
        if (q.answers) {
          q.answers.forEach((a: any) => {
            if (a.correct) {
              delete a.correct;
            }
          });
        }
      });

      return exam;
    } catch (error) {
      throw new Error(error);
    }
  }
}
