/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/naming-convention */
import {
  authenticate,
  TokenService,
  UserService,
} from '@loopback/authentication';
import { TokenServiceBindings } from '@loopback/authentication-jwt';
import { authorize } from '@loopback/authorization';
import { inject } from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
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
import { SecurityBindings, securityId, UserProfile } from '@loopback/security';
import _ from 'lodash';
import { MyCourse, MyExam, Transcript, User } from '../models';
import {
  ChangePassData,
  CouponRepository,
  CourseRepository,
  Credentials,
  DonateMoneyData,
  ExamRepository,
  GradingCourse,
  GradingExam,
  MyCourseRepository,
  MyExamRepository,
  PurchaseCourseData,
  PurchaseTranscriptData,
  S3SignedUrl,
  SendMailData,
  UpdateUserData,
  UserRepository,
} from '../repositories';
import {
  AwsService,
  basicAuthorization,
  JsonToCsvService,
  MailerService,
  PasswordHasher,
  UserManagementService,
  validateCredentials,
  validateEmail,
} from '../services';
import { StripeService } from '../services/stripe.service';
import { OPERATION_SECURITY_SPEC } from '../utils';
import { PasswordHasherBindings, UserServiceBindings } from '../utils/keys';
import { config } from './../config';
import { NewUserRequest } from './../models/new-user-request.model';
import {
  CredentialsRequestBody,
  DonateMoneyRequestBody,
  GenerateS3UrlRequestBody,
  GradeCourseRequestBody,
  GradeExamRequestBody,
  PasswordResetRequestBody,
  PurchaseCourseRequestBody,
  PurchaseTranscriptRequestBody,
  SendMailRequestBody,
  UpdatePasswordRequestBody,
  UpdateProfileRequestBody,
} from './specs/user-controller.specs';
export class UserController {
  constructor(
    // repositories
    @repository(UserRepository)
    public userRepository: UserRepository,
    @repository(CourseRepository)
    public courseRepository: CourseRepository,
    @repository(MyCourseRepository)
    public myCourseRepository: MyCourseRepository,
    @repository(ExamRepository)
    public examRepository: ExamRepository,
    @repository(MyExamRepository)
    public myExamRepository: MyExamRepository,
    @repository(CouponRepository)
    public couponRepository: CouponRepository,
    // services
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: UserService<User, Credentials>,
    @inject(UserServiceBindings.USER_SERVICE)
    public userManagementService: UserManagementService,
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public passwordHasher: PasswordHasher,
    @inject('services.MailerService')
    public mailerService: MailerService,
    @inject('services.AwsService')
    public awsService: AwsService,
    @inject('services.StripeService')
    public stripeService: StripeService,
    @inject('services.JsonToCsvService')
    public jsonToCsvService: JsonToCsvService,
  ) { }

  // Create new user
  @post('/users')
  @response(200, {
    description: 'User model instance',
    content: { 'application/json': { schema: getModelSchemaRef(User) } },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(NewUserRequest, {
            title: 'NewUser',
            exclude: ['id', 'DateCreated', 'versalUserID'],
          }),
        },
      },
    })
    newUserRequest: NewUserRequest,
  ): Promise<User> {
    validateCredentials(_.pick(newUserRequest, ['email', 'password']));
    try {
      return await this.userManagementService.createUser(newUserRequest);
    } catch (error) {
      // MongoError 11000 duplicate key
      if (error.code === 11000 && error.errmsg.includes('index: uniqueEmail')) {
        throw new HttpErrors.Conflict('Email value is already taken');
      } else {
        throw error;
      }
    }
  }

  // User model count
  @get('/users/count')
  @response(200, {
    description: 'User model count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async count(@param.where(User) where?: Where<User>): Promise<Count> {
    return this.userRepository.count(where);
  }

  // Array of User model instances
  @get('/users', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Array of User model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(User, { includeRelations: false }),
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
  async find(@param.where(User) where?: Where<User>): Promise<User[]> {
    return this.userRepository.find({ where });
  }

  // Get user by ID
  @get('/users/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'User model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(User, { includeRelations: false }),
          },
        },
      },
    },
  })
  @authenticate('jwt')
  async findById(
    @param.path.string('id') id: string,
    @param.filter(User, { exclude: 'include' }) filter?: Filter<User>,
  ): Promise<User> {
    return this.userRepository.findById(id, filter);
  }

  // Get current user profile
  @get('/users/me', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'The current user profile',
        content: {
          'application/json': {
            schema: getModelSchemaRef(User, { includeRelations: true }),
          },
        },
      },
    },
  })
  @authenticate('jwt')
  async printCurrentUser(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
  ): Promise<User> {
    try {
      const userId = currentUserProfile[securityId];
      return await this.userRepository.findById(userId, { include: ['roles'] });
    } catch (error) {
      throw new Error(error);
    }
  }

  // User patch by ID
  @patch('/users/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'User PATCH success',
        content: {
          'application/json': {
            schema: getModelSchemaRef(User, { includeRelations: true }),
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
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, { partial: true }),
        },
      },
    })
    user: User,
  ): Promise<void> {
    return this.userRepository.updateById(id, user);
  }

  // User PUT
  @put('/users/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'User PUT success',
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
    @requestBody() user: User,
  ): Promise<void> {
    await this.userRepository.replaceById(id, user);
  }

  // delete user by ID
  @del('/users/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'User DELETE success',
      },
    },
  })
  @authenticate('jwt')
  @authorize({
    allowedRoles: ['admin', 'support'],
    voters: [basicAuthorization],
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.userRepository.deleteById(id);
  }

  /**
   * A login function that returns an access token. After login, include the token
   * in the next requests to verify your identity.
   * @param credentials User email and password
   */
  @post('/users/login')
  @response(200, {
    responses: {
      '200': {
        description: 'User authentication',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  })
  async login(
    @requestBody(CredentialsRequestBody) credentials: Credentials,
  ): Promise<{ token: string; }> {
    // ensure the user exists, and the password is correct
    const user = await this.userService.verifyCredentials(credentials);

    // convert a User object into a UserProfile object (reduced set of properties)
    const userProfile = this.userService.convertToUserProfile(user);

    // create a JSON Web Token based on the user profile
    const token = await this.jwtService.generateToken(userProfile);
    return { token };
  }

  /**
   * Creates session with versal
   * @return sessionData: Object
   */
  @post('/users/versal-login', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Creates session with versal',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                response: 'object',
              },
            },
          },
        },
      },
    },
  })
  @authenticate('jwt')
  async versalLogin(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
  ): Promise<Object> {
    try {
      const { id } = currentUserProfile;

      const user = await this.userRepository.findById(id);

      if (!user) {
        throw new HttpErrors.NotFound('User account not found');
      }

      const session = await this.userManagementService.createVersalSession(
        user,
      );
      return session;
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Update user profile
   * @param firstName: string;
   * @param lastName: string;
   * @param PhoneNumber: string;
   * @return {user: Object<User>}
   */
  @put('/users/update-profile', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'The updated user profile',
        content: {
          'application/json': {
            schema: UpdateProfileRequestBody,
          },
        },
      },
    },
  })
  @authenticate('jwt')
  async updateProfile(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
    @requestBody(UpdateProfileRequestBody) updateUserData: UpdateUserData,
  ): Promise<{ user: User; }> {
    try {
      const userId = currentUserProfile[securityId];
      await this.userRepository.updateById(userId, updateUserData);

      const user = await this.userRepository.findById(userId);
      return { user };
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Update user password
   * @return {token: string}
   */
  @put('/users/update-password', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'The updated user profile',
        content: {
          'application/json': {
            schema: UpdatePasswordRequestBody,
          },
        },
      },
    },
  })
  @authenticate('jwt')
  async updatePassword(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
    @requestBody(UpdatePasswordRequestBody) changePassData: ChangePassData,
  ): Promise<{ token: string; }> {
    const { oldPassword, newPassword } = changePassData;

    const userId = currentUserProfile[securityId];
    const invalidCredentialsError = "Passwords don't match.";

    // check if userId exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new HttpErrors.NotFound('User account not found');
    }

    // check if old password is correct
    const credentialsFound = await this.userRepository.findCredentials(userId);
    if (!credentialsFound) {
      throw new HttpErrors.Unauthorized('Invalid credentials');
    }
    // check if old and new password match
    const passwordMatched = await this.passwordHasher.comparePassword(
      oldPassword,
      credentialsFound.password,
    );
    if (!passwordMatched) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    // hash new password
    const passwordHash = await this.passwordHasher.hashPassword(newPassword);
    const updatePass = await this.userRepository
      .userCredentials(user.id)
      .patch({ password: passwordHash });

    if (updatePass.count === 0) {
      throw new Error('Failed to update password');
    }

    // generate token
    const userProfile = this.userService.convertToUserProfile(user);
    const token = await this.jwtService.generateToken(userProfile);
    return { token };
  }

  /**
   * A forgotPassword function that returns an access token.
   * @param credentials User email and password
   */
  @put('/users/forgot-password', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'The updated user profile',
        content: {
          'application/json': {
            schema: PasswordResetRequestBody,
          },
        },
      },
    },
  })
  @authenticate('jwt')
  async forgotPassword(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
    @requestBody(PasswordResetRequestBody) credentials: Credentials,
  ): Promise<{ token: string; }> {
    const { email, password } = credentials;
    const { id } = currentUserProfile;

    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new HttpErrors.NotFound('User account not found');
    }

    if (email !== user?.email) {
      throw new HttpErrors.Forbidden('Invalid email address');
    }

    validateCredentials(_.pick(credentials, ['email', 'password']));

    const passwordHash = await this.passwordHasher.hashPassword(password);

    await this.userRepository
      .userCredentials(user.id)
      .patch({ password: passwordHash });

    const userProfile = this.userService.convertToUserProfile(user);

    const token = await this.jwtService.generateToken(userProfile);

    return { token };
  }

  /**
   * Get purchased courses
   * @return {MyCourses: Array<MyCourse>}
   */
  @get('/users/get-my-courses', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'User purchased courses',
        content: {
          'application/json': {
            schema: getModelSchemaRef(MyCourse, { includeRelations: true }),
          },
        },
      },
    },
  })
  @authenticate('jwt')
  async getMyCourses(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
  ): Promise<MyCourse[]> {
    try {
      const userId = currentUserProfile[securityId];
      const MyCourses = await this.userRepository
        .myCourses(userId)
        .find({ include: ['course'] });
      return MyCourses;
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Get my course by ID
   * @return {MyCourses: MyCourse}
   */
  @get('/users/get-my-course', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'MyCourse by ID',
        content: {
          'application/json': {
            schema: getModelSchemaRef(MyCourse, { includeRelations: true }),
          },
        },
      },
    },
  })
  @authenticate('jwt')
  async getMyCourse(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
    @param.query.string('id', { required: true }) id: string,
  ): Promise<MyCourse> {
    try {
      const userId = currentUserProfile[securityId];
      const myCourse = await this.userRepository
        .myCourses(userId)
        .find({ where: { courseId: id }, include: ['course'] });

      return myCourse[0] ?? {};
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Get my exams
   * @return {MyExams: Array<MyExam>}
   */
  @get('/users/get-my-exams', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Get user exams',
        content: {
          'application/json': {
            schema: getModelSchemaRef(MyExam, { includeRelations: true }),
          },
        },
      },
    },
  })
  @authenticate('jwt')
  async getMyExams(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
    // eslint-disable-next-line
  ): Promise<MyExam[]> {
    try {
      const userId = currentUserProfile[securityId];
      const MyExams = await this.userRepository
        .myExams(userId)
        .find({ include: ['exam'] });
      // eslint-disable-next-line
      MyExams.map((exam: any) => {
        const myExam = exam.toJSON();
        if (myExam.exam) myExam.exam.quiz = null;
        return myExam;
      });

      return MyExams;
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Complete my course
   * @param id:string
   * @return {success: boolean}
   */
  @put('/users/complete-my-course', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Complete my course',
      },
    },
  })
  @authenticate('jwt')
  async completeMyCourse(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
    @param.query.string('id', { required: true }) id: string,
  ): Promise<{ success: boolean; }> {
    try {
      const userId = currentUserProfile[securityId];
      const where: Where = { courseId: id };
      const updatedCourse = await this.userRepository
        .myCourses(userId)
        .patch({ completed: 'true', completedDate: new Date() }, where);

      return { success: updatedCourse.count > 0 };
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Get completed courses
   * @return {MyCourses: Array<MyCourse>}
   */
  @get('/users/get-completed-courses', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Get user completed courses',
        content: {
          'application/json': {
            schema: getModelSchemaRef(MyCourse, { includeRelations: true }),
          },
        },
      },
    },
  })
  @authenticate('jwt')
  async getCompletedCourses(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
    // eslint-disable-next-line
  ): Promise<MyCourse[]> {
    try {
      const userId = currentUserProfile[securityId];
      return await this.userRepository
        .myCourses(userId)
        .find({ where: { completed: true }, include: ['course'] });
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Get user transcripts
   * @return {Transcripts: Array<Transcript>}
   */
  @get('/users/get-transcripts', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'User transcripts',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Transcript, { includeRelations: true }),
          },
        },
      },
    },
  })
  @authenticate('jwt')
  async getTranscripts(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
  ): Promise<Transcript[]> {
    try {
      const userId = currentUserProfile[securityId];
      return await this.userRepository.transcripts(userId).find();
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Get user roles
   * @return {Transcripts: Array<Transcript>}
   */
  @get('/users/get-roles', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'User Roles',
      },
    },
  })
  @authenticate('jwt')
  async getRoles(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
  ): Promise<any> {
    try {
      const userId = currentUserProfile[securityId];
      return await this.userRepository.roles(userId).find();
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Grade user course
   */
  @post('/users/grade-course', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Grade user course',
        content: {
          'application/json': {
            schema: GradeCourseRequestBody,
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
  async gradeCourse(
    @requestBody(GradeCourseRequestBody) body: GradingCourse,
  ): Promise<{ success: boolean; }> {
    try {
      const { myCourseId, grade } = body;
      // check if myCourseId exists
      const myCourse = await this.myCourseRepository.findById(myCourseId, {
        include: ['course', 'owner'],
      });
      if (!myCourse) {
        throw new HttpErrors.NotFound('My Course not found');
      }

      // update MyCourse grade
      await this.myCourseRepository.updateById(myCourseId, {
        grade: grade,
      });

      // send course grade email
      await this.mailerService.sendCourseGradeMail(
        myCourse.owner?.email ?? '',
        myCourse.course?.title ?? '',
        grade,
      );

      return { success: true };
    } catch (error) {
      if (error.code === 'ENTITY_NOT_FOUND') {
        throw new HttpErrors.NotFound('My Course not found');
      } else {
        throw new Error(error);
      }
    }
  }

  /**
   * Grade user exam
   */
  @post('/users/grade-exam', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Grade user exam',
        content: {
          'application/json': {
            schema: GradeExamRequestBody,
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
  async gradeExam(
    @requestBody(GradeExamRequestBody) body: GradingExam,
  ): Promise<{ success: boolean; }> {
    try {
      const { myExamId, grade } = body;
      // check if myExamId exists
      const myExam = await this.myExamRepository.findById(myExamId, {
        include: ['exam', 'owner'],
      });
      if (!myExam) {
        throw new HttpErrors.NotFound('My Exam not found');
      }

      // update MyExam grade
      await this.myExamRepository.updateById(myExamId, {
        grade: grade,
      });

      // send course grade email
      await this.mailerService.sendExamGradeMail(
        myExam.owner?.email ?? '',
        myExam.exam?.name ?? '',
        grade,
      );

      return { success: true };
    } catch (error) {
      if (error.code === 'ENTITY_NOT_FOUND') {
        throw new HttpErrors.NotFound('My Exam not found');
      } else {
        throw new Error(error);
      }
    }
  }

  /**
   * Generate S3 presigned URL
   */
  @post('/users/generate-s3-presigned-url', {
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
    @requestBody(GenerateS3UrlRequestBody) body: S3SignedUrl,
  ): Promise<{ url: any; }> {
    try {
      const { fileName, fileType } = body;
      const params = {
        Bucket: 'triobucket',
        Key: fileName,
        Expires: 60 * 60,
        ACL: 'public-read',
        ContentType: fileType,
      };
      const url = await this.awsService.getSignedUrl(params);
      return { url };
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * User purchase courses
   */
  @post('/users/purchase-courses', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'User purchase courses',
        content: {
          'application/json': {
            schema: PurchaseCourseRequestBody,
          },
        },
      },
    },
  })
  @authenticate('jwt')
  async purchaseCourses(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
    @requestBody(PurchaseCourseRequestBody) body: PurchaseCourseData,
  ): Promise<{ success: boolean; }> {
    try {
      const { courses: coursesToPurchase, stripePayload, couponCode } = body;
      const userId = currentUserProfile[securityId];

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new HttpErrors.NotFound('User account not found');
      }

      const cart: Array<object> = [];
      const allCourses = await this.courseRepository.find();
      const ownedCourses = await this.userRepository.myCourses(userId).find();

      coursesToPurchase.forEach((course: any) => {
        // check for duplicate courses
        const isDuplicate = coursesToPurchase.filter(
          (item: any) => item.id === course.id,
        );
        if (isDuplicate.length > 1) {
          throw new Error(`Duplicate course in cart with ID ${course.id}`);
        }

        // validate if courses are real
        const isValid = allCourses.find((item: any) => {
          if (item.id === course.id) {
            cart.push(item); // push real course object to cart
            return true;
          }
          return false;
        });
        if (!isValid) {
          throw new Error('Invalid course found with ID ' + course.id);
        }

        // check if already purchased
        if (ownedCourses.length > 0) {
          const isPurchased = ownedCourses.find(
            item => item.courseId === course.id,
          );
          if (isPurchased) {
            throw new Error('Course already purchased with ID ' + course.id);
          }
        }
      });

      // Coupon validation
      let couponDiscount = 0;
      if (couponCode) {
        const coupon = await this.couponRepository.findOne({
          where: { code: couponCode },
        });

        if (!coupon) {
          throw new Error('Invalid coupon');
        }
        couponDiscount = coupon.discount;
      }

      //Purchase course
      let price = 0;
      let coursesMeta = '';
      cart.forEach((course: any) => {
        price += parseFloat(course.price);
        coursesMeta += `${course.title}, `;
      });
      coursesMeta = coursesMeta.replace(/(, $)/g, '');

      // Apply coupon discount
      if (couponDiscount === 100) {
        price = 0; // 100% discount
      } else if (couponDiscount > 0) {
        price = ((100 - couponDiscount) * price) / 100;
      }

      //Charge stripe card if needed
      if (price > 0) {
        await this.stripeService.createCharges({
          amount: price * 100,
          currency: 'usd',
          description: 'WOKE Courses course purchase',
          source: stripePayload.id,
          metadata: {
            courses: coursesMeta,
            user_email: user.email,
            user_firstname: user.firstName,
            user_lastname: user.lastName,
          },
        });
      }

      /**
       * Create my courses for purchased courses
       */
      const myCourses = cart.map((course: any) => {
        return { courseId: course.id };
      });

      let saveSuccess = true;
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      myCourses.forEach(async (myCourse: any) => {
        const savedMyCourse = await this.userRepository
          .myCourses(userId)
          .create(myCourse);

        saveSuccess = !!savedMyCourse;
      });

      return { success: saveSuccess };
    } catch (error) {
      if (error.code === 'ENTITY_NOT_FOUND') {
        throw new HttpErrors.NotFound('My Course not found');
      } else {
        throw new Error(error);
      }
    }
  }

  /**
   * User purchase transcript
   */
  @post('/users/purchase-transcript', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'User purchase transcript',
        content: {
          'application/json': {
            schema: PurchaseTranscriptRequestBody,
          },
        },
      },
    },
  })
  @authenticate('jwt')
  async purchaseTranscript(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
    @requestBody(PurchaseTranscriptRequestBody) body: PurchaseTranscriptData,
  ): Promise<{ success: boolean; }> {
    try {
      const { stripePayload } = body;
      const userId = currentUserProfile[securityId];
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new HttpErrors.NotFound('User account not found');
      }

      const price = config.price.transcript ?? 12;
      const charge = await this.stripeService.createCharges({
        amount: price * 100,
        currency: 'usd',
        description: 'WOKE COURSES transcript purchase',
        source: stripePayload.id,
        metadata: {
          user_email: user.email,
          user_firstname: user.firstName,
          user_lastname: user.lastName,
        },
      });

      if (charge.status !== 'succeeded') {
        throw new Error('Failed to create charges using stripe');
      }

      const completedCourses = await this.userRepository
        .myCourses(userId)
        .find({
          where: { completed: true },
          include: ['course'],
        });

      if (completedCourses.length === 0) {
        throw new Error(
          'No completed course/s found. Unable to create transcript',
        );
      }

      const transcriptContent = completedCourses.map(item => {
        const myCourse: any = item.toJSON();
        return {
          course: myCourse.course.title,
          credits: myCourse.course.credits,
          completedDate: myCourse.completedDate ?? new Date(),
          grade: myCourse.grade ?? '',
        };
      });

      const transcript = {
        date: new Date(),
        content: JSON.stringify(transcriptContent),
      };

      const newTranscript = await this.userRepository
        .transcripts(userId)
        .create(transcript);

      return { success: !!newTranscript };
    } catch (error) {
      throw new HttpErrors.NotAcceptable(error.message);
    }
  }

  /**
   * User send mail to WokeCourses
   */
  @post('/users/send-mail', {
    responses: {
      '200': {
        description: 'User send mail to WokeCourses',
        content: {
          'application/json': {
            schema: SendMailRequestBody,
          },
        },
      },
    },
  })
  async sendMail(
    @requestBody(SendMailRequestBody) body: SendMailData,
  ): Promise<{ success: boolean; }> {
    try {
      const { email } = body;
      if (!validateEmail(email)) {
        throw new Error('Invalid email');
      }
      await this.mailerService.sendContactMail({ ...body });

      return { success: true };
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * User Donate Money
   */
  @post('/users/donate-money', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'User donate money',
        content: {
          'application/json': {
            schema: DonateMoneyRequestBody,
          },
        },
      },
    },
  })
  @authenticate('jwt')
  async donateMoney(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
    @requestBody(DonateMoneyRequestBody) body: DonateMoneyData,
  ): Promise<any> {
    try {
      const { stripePayload, message, amount } = body;
      const userId = currentUserProfile[securityId];

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new HttpErrors.NotFound('User account not found');
      }

      return await this.stripeService.createCharges({
        amount: amount * 100,
        currency: 'usd',
        description: message,
        source: stripePayload.id,
        metadata: {
          user_email: user.email,
          user_firstname: user.firstName,
          user_lastname: user.lastName,
        },
      });
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Exports users to CSV
   */
  @get('/users/export-users-to-csv', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: ' Exports users to CSV',
        content: {
          'application/json': {
            schema: {
              options: Object,
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
  async exportUsersToCSV(
    @requestBody({ options: Object }) options: Object,
  ): Promise<any> {
    try {
      const users = await this.userRepository.find();
      if (!users) throw new Error('No users to export');

      users.forEach((user: any) => {
        user.title = 'Trio-Student';
        user.fullName = `${user.firstName} ${user.lastName}`;
        if (!user.DateCreated) user.DateCreated = new Date();
      });

      return await this.jsonToCsvService.exportUsers(users);
    } catch (error) {
      console.log({ error });
      throw new Error(error);
    }
  }

  /**
   * User update new password
   */
  @post('/users/set-new-password', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'User update new password',
      },
    },
  })
  @authenticate('jwt')
  @authorize({
    allowedRoles: ['admin', 'support'],
    voters: [basicAuthorization],
  })
  async setNewPassword(
    @param.query.string('id', { required: true }) id: string,
    @param.query.string('newPassword', { required: true }) newPassword: string,
  ): Promise<{ success: boolean; }> {
    try {
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new HttpErrors.NotFound('User account not found');
      }
      const passwordHash = await this.passwordHasher.hashPassword(newPassword);
      const updatePass = await this.userRepository
        .userCredentials(id)
        .patch({ password: passwordHash });

      if (updatePass.count === 0) {
        throw new Error('Failed to update password');
      }

      return { success: updatePass.count > 0 };
    } catch (error) {
      throw new Error(error);
    }
  }
}
