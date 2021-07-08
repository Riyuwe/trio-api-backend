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
import {Course} from '../models';
import {CourseRepository, UserRepository} from '../repositories';
import {basicAuthorization} from '../services';
import {OPERATION_SECURITY_SPEC} from './../utils/security-specs';

export class CourseController {
  constructor(
    @repository(CourseRepository)
    public courseRepository: CourseRepository,
    @repository(UserRepository)
    public userRepository: UserRepository,
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
  ) {}

  @post('/courses', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Course model instance',
        content: {'application/json': {schema: getModelSchemaRef(Course)}},
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
          schema: getModelSchemaRef(Course, {
            title: 'NewCourse',
            exclude: ['id'],
          }),
        },
      },
    })
    course: Omit<Course, 'id'>,
  ): Promise<Course> {
    return this.courseRepository.create(course);
  }

  @get('/courses/count')
  @response(200, {
    description: 'Course model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Course) where?: Where<Course>): Promise<Count> {
    return this.courseRepository.count(where);
  }

  @get('/courses', {
    responses: {
      '200': {
        description: 'Array of Course model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Course, {includeRelations: false}),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(Course, {exclude: 'include'}) filter?: Filter<Course>,
  ): Promise<Course[]> {
    return this.courseRepository.find(filter);
  }

  @patch('/courses', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Course PATCH success count',
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
          schema: getModelSchemaRef(Course, {partial: true}),
        },
      },
    })
    course: Course,
    @param.where(Course) where?: Where<Course>,
  ): Promise<Count> {
    return this.courseRepository.updateAll(course, where);
  }

  @get('/courses/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Course model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Course, {includeRelations: false}),
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
    @param.filter(Course, {exclude: 'where'})
    filter?: FilterExcludingWhere<Course>,
  ): Promise<Course> {
    return this.courseRepository.findById(id, filter);
  }

  @patch('/courses/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Course PATCH success',
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
          schema: getModelSchemaRef(Course, {partial: true}),
        },
      },
    })
    course: Course,
  ): Promise<void> {
    await this.courseRepository.updateById(id, course);
  }

  @put('/courses/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Course PUT success',
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
    @requestBody() course: Course,
  ): Promise<void> {
    await this.courseRepository.replaceById(id, course);
  }

  @del('/courses/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Course DELETE success',
      },
    },
  })
  @authenticate('jwt')
  @authorize({
    allowedRoles: ['admin', 'support'],
    voters: [basicAuthorization],
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.courseRepository.deleteById(id);
  }

  // Assign course to user
  @post('/courses/assign-course-to-user', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Assign course to user',
      },
    },
  })
  @authenticate('jwt')
  @authorize({
    allowedRoles: ['admin', 'support'],
    voters: [basicAuthorization],
  })
  async assignCourseToUser(
    @param.query.string('userId', {required: true}) userId: string,
    @param.query.string('courseId', {required: true}) courseId: string,
  ): Promise<{success: boolean}> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new HttpErrors.NotFound('User account not found');
      }

      const isAlreadyAssigned = await this.userRepository
        .myCourses(userId)
        .find({
          where: {courseId: courseId},
        });

      if (isAlreadyAssigned.length > 0) {
        throw new Error('User is already attending this course');
      }

      const assignCourse = await this.userRepository
        .myCourses(userId)
        .create({courseId});

      return {success: !!assignCourse};
    } catch (error) {
      throw new HttpErrors.NotAcceptable(error.message);
    }
  }
}
