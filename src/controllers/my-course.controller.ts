import {authenticate, TokenService} from '@loopback/authentication';
import {TokenServiceBindings} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
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
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {MyCourse} from '../models';
import {MyCourseRepository} from '../repositories';
import {OPERATION_SECURITY_SPEC} from './../utils/security-specs';

export class MyCourseController {
  constructor(
    @repository(MyCourseRepository)
    public myCourseRepository: MyCourseRepository,
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
  ) {}

  @post('/my-courses', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'MyCourse model instance',
        content: {'application/json': {schema: getModelSchemaRef(MyCourse)}},
      },
    },
  })
  @authenticate('jwt')
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(MyCourse, {
            title: 'NewMyCourse',
            exclude: ['id'],
          }),
        },
      },
    })
    myCourse: Omit<MyCourse, 'id'>,
  ): Promise<MyCourse> {
    return this.myCourseRepository.create(myCourse);
  }

  @get('/my-courses/count')
  @response(200, {
    description: 'MyCourse model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(MyCourse) where?: Where<MyCourse>): Promise<Count> {
    return this.myCourseRepository.count(where);
  }

  @get('/my-courses', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Array of MyCourse model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(MyCourse, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  @authenticate('jwt')
  async find(
    @param.filter(MyCourse) filter?: Filter<MyCourse>,
  ): Promise<MyCourse[]> {
    return this.myCourseRepository.find(filter);
  }

  @patch('/my-courses', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'MyCourse PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  @authenticate('jwt')
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(MyCourse, {partial: true}),
        },
      },
    })
    myCourse: MyCourse,
    @param.where(MyCourse) where?: Where<MyCourse>,
  ): Promise<Count> {
    return this.myCourseRepository.updateAll(myCourse, where);
  }

  @get('/my-courses/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'MyCourse model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(MyCourse, {includeRelations: true}),
          },
        },
      },
    },
  })
  @authenticate('jwt')
  async findById(
    @param.path.string('id') id: string,
    @param.filter(MyCourse) filter?: Filter<MyCourse>,
  ): Promise<MyCourse> {
    return this.myCourseRepository.findById(id, filter);
  }

  @patch('/my-courses/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'MyCourse PATCH success',
      },
    },
  })
  @authenticate('jwt')
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(MyCourse, {partial: true}),
        },
      },
    })
    myCourse: MyCourse,
  ): Promise<void> {
    await this.myCourseRepository.updateById(id, myCourse);
  }

  @put('/my-courses/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'MyCourse PUT success',
      },
    },
  })
  @authenticate('jwt')
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() myCourse: MyCourse,
  ): Promise<void> {
    await this.myCourseRepository.replaceById(id, myCourse);
  }

  @del('/my-courses/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'MyCourse DELETE success',
      },
    },
  })
  @authenticate('jwt')
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.myCourseRepository.deleteById(id);
  }
}
