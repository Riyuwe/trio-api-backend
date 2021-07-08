/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-shadow */
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
import {MyExam} from '../models';
import {
  ExamRepository,
  ExamS3SignedUrl,
  MyExamRepository,
  RoleRepository,
  UpdateEssayUrl,
  UpdateQuestionsAnswers,
  UserRepository,
} from '../repositories';
import {AwsService, basicAuthorization, MailerService} from '../services';
import {OPERATION_SECURITY_SPEC} from './../utils/security-specs';
import {
  GenerateS3UrlRequestBody,
  UpdateEssayUrlRequestBody,
  UpdateQuestionsAnswersRequestBody,
} from './specs/exam-controller.specs';

export class MyExamController {
  constructor(
    // repositories
    @repository(MyExamRepository)
    public myExamRepository: MyExamRepository,
    @repository(UserRepository)
    public userRepository: UserRepository,
    @repository(ExamRepository)
    public examRepository: ExamRepository,
    @repository(RoleRepository)
    public roleRepository: RoleRepository,
    // services
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @inject('services.MailerService')
    public mailerService: MailerService,
    @inject('services.AwsService')
    public awsService: AwsService,
  ) {}

  @post('/my-exams', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'MyExam model instance',
        content: {'application/json': {schema: getModelSchemaRef(MyExam)}},
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
          schema: getModelSchemaRef(MyExam, {
            title: 'NewMyExam',
            exclude: ['id'],
          }),
        },
      },
    })
    myExam: Omit<MyExam, 'id'>,
  ): Promise<MyExam> {
    return this.myExamRepository.create(myExam);
  }

  @get('/my-exams/count')
  @response(200, {
    description: 'MyExam model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(MyExam) where?: Where<MyExam>): Promise<Count> {
    return this.myExamRepository.count(where);
  }

  @get('/my-exams', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Array of MyExam model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(MyExam, {includeRelations: true}),
            },
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
  async find(@param.filter(MyExam) filter?: Filter<MyExam>): Promise<MyExam[]> {
    return this.myExamRepository.find(filter);
  }

  @patch('/my-exams', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'MyExam PATCH success count',
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
          schema: getModelSchemaRef(MyExam, {partial: true}),
        },
      },
    })
    myExam: MyExam,
    @param.where(MyExam) where?: Where<MyExam>,
  ): Promise<Count> {
    return this.myExamRepository.updateAll(myExam, where);
  }

  @get('/my-exams/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'MyExam model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(MyExam, {includeRelations: false}),
          },
        },
      },
    },
  })
  @authenticate('jwt')
  async findById(
    @param.path.string('id') id: string,
    @param.filter(MyExam, {exclude: ['where']})
    filter?: FilterExcludingWhere<MyExam>,
  ): Promise<MyExam> {
    return this.myExamRepository.findById(id, {include: ['exam']});
  }

  @patch('/my-exams/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'MyExam PATCH success',
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
          schema: getModelSchemaRef(MyExam, {partial: true}),
        },
      },
    })
    myExam: MyExam,
  ): Promise<void> {
    await this.myExamRepository.updateById(id, myExam);
  }

  @put('/my-exams/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'MyExam PUT success',
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
    @requestBody() myExam: MyExam,
  ): Promise<void> {
    await this.myExamRepository.replaceById(id, myExam);
  }

  @del('/my-exams/{id}')
  @response(200, {
    description: 'MyExam DELETE success',
  })
  @authenticate('jwt')
  @authorize({
    allowedRoles: ['admin', 'support'],
    voters: [basicAuthorization],
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.myExamRepository.deleteById(id);
  }

  // Request exam permission
  @post('/my-exams/request-exam-permission', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Request exam permission',
        content: {
          'application/json': {
            schema: {
              examId: String,
            },
          },
        },
      },
    },
  })
  @authenticate('jwt')
  async requestExamPermission(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
    @param.query.string('examId', {required: true}) examId: string,
  ): Promise<{success: boolean}> {
    try {
      const userId = currentUserProfile[securityId];
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new HttpErrors.NotFound('User account not found');
      }

      const exam = await this.examRepository.findById(examId);
      if (!exam) {
        throw new HttpErrors.NotFound('Exam not found');
      }

      const myExam = await this.myExamRepository.findOne({
        where: {
          examId: examId,
          userId: userId,
        },
      });
      if (myExam) {
        throw new Error('Exam permission already requested');
      }

      const createdMyExam = await this.myExamRepository.create({
        userId,
        examId,
        date: new Date(),
      });

      if (!createdMyExam) {
        throw new Error('Failed to save my exam');
      }

      // notify admins by email
      const adminRole: any = await this.roleRepository.findOne({
        where: {name: 'admin'},
        include: [
          {
            relation: 'users',
            scope: {
              include: ['owner'],
            },
          },
        ],
      });

      if (!adminRole) {
        throw new Error('No admin role found');
      }

      const adminUsers = adminRole.users ?? [];
      if (adminUsers.length === 0) {
        throw new Error('No admin users found');
      }

      const adminEmails = adminUsers.map((user: any) => user.owner.email);
      const notifyAdmins =
        await this.mailerService.sendExamRequestPermissionMail(
          adminEmails,
          user,
          exam,
        );

      return {success: !!notifyAdmins.messageId};
    } catch (error) {
      throw new Error(error);
    }
  }
  // Allow permission to take the exam
  @patch('/my-exams/allow-exam-permission', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Allow permission to take the exam',
        content: {
          'application/json': {
            schema: {
              examId: String,
            },
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
  async allowExamPermission(
    @param.query.string('examId', {required: true}) examId: string,
  ): Promise<void> {
    return this.myExamRepository.updateById(examId, {
      permissionGranted: true,
    });
  }

  /**
   * Generate S3 presigned URL
   */
  @post('/my-exams/generate-s3-presigned-url', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Generate S3 presigned URL',
        content: {
          'application/json': {
            schema: GenerateS3UrlRequestBody,
          },
        },
      },
    },
  })
  @authenticate('jwt')
  async generateS3PresignedURL(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
    @requestBody(GenerateS3UrlRequestBody) body: ExamS3SignedUrl,
  ): Promise<{url: any}> {
    try {
      const userId = currentUserProfile[securityId];
      const {fileName, fileType, examId} = body;
      const allowedFileTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];

      const myExam: any = await this.myExamRepository.findById(examId, {
        include: ['exam'],
      });
      if (!myExam) {
        throw new Error('Exam not found');
      }

      if (!myExam.permissionGranted) {
        throw new Error('Permission not granted');
      }

      // validate file type
      if (allowedFileTypes.indexOf(fileType) < 0) {
        throw new Error('Invalid file type');
      }

      const exam = myExam.toJSON().exam;
      const params = {
        Bucket: 'triobucket',
        Key: 'trio-exams/' + userId + '/' + exam.id + '/' + fileName,
        Expires: 60 * 60,
        ACL: 'public-read',
        ContentType: fileType,
      };
      const url = await this.awsService.getSignedUrl(params);
      return {url};
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Update exam essay url
   */
  @post('/my-exams/update-essay-url', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Update exam essay url',
        content: {
          'application/json': {
            schema: UpdateEssayUrlRequestBody,
          },
        },
      },
    },
  })
  @authenticate('jwt')
  async updateEssayUrl(
    @requestBody(UpdateEssayUrlRequestBody) body: UpdateEssayUrl,
  ): Promise<{success: boolean}> {
    try {
      const {examId, url} = body;
      const myExam = await this.myExamRepository.findById(examId);
      if (!myExam) {
        throw new Error('Exam not found');
      }

      if (!myExam.permissionGranted) {
        throw new Error('Permission not granted');
      }

      if (myExam.essayCompleted) {
        throw new Error('Essay already completed');
      }

      await this.myExamRepository.updateById(examId, {
        essayUrl: url,
        essayCompleted: true,
        essayCompletedDate: new Date(),
      });

      return {success: true};
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Update exam question's answers
   */
  @post('/my-exams/update-questions-answers', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: "Update exam question's answers",
        content: {
          'application/json': {
            schema: UpdateQuestionsAnswersRequestBody,
          },
        },
      },
    },
  })
  @authenticate('jwt')
  async updateQuestionsAnswers(
    @requestBody(UpdateQuestionsAnswersRequestBody)
    body: UpdateQuestionsAnswers,
  ): Promise<{success: boolean}> {
    try {
      const {examId, answers} = body;
      const myExam = await this.myExamRepository.findById(examId);
      if (!myExam) {
        throw new Error('Exam not found');
      }

      if (!myExam.permissionGranted) {
        throw new Error('Permission not granted');
      }

      if (myExam.essayCompleted) {
        throw new Error('Essay already completed');
      }

      await this.myExamRepository.updateById(examId, {
        examQuestionsAnswers: answers,
      });

      return {success: true};
    } catch (error) {
      throw new Error(error);
    }
  }
}
