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
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {Transcript} from '../models';
import {TranscriptRepository} from '../repositories';
import {TokenServiceBindings} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import {authenticate, TokenService} from '@loopback/authentication';
import {OPERATION_SECURITY_SPEC} from './../utils/security-specs';

export class TranscriptController {
  constructor(
    @repository(TranscriptRepository)
    public transcriptRepository: TranscriptRepository,
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
  ) {}

  @post('/transcripts', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Transcript model instance',
        content: {'application/json': {schema: getModelSchemaRef(Transcript)}},
      },
    },
  })
  @authenticate('jwt')
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Transcript, {
            title: 'NewTranscript',
            exclude: ['id'],
          }),
        },
      },
    })
    transcript: Omit<Transcript, 'id'>,
  ): Promise<Transcript> {
    return this.transcriptRepository.create(transcript);
  }

  @get('/transcripts/count')
  @response(200, {
    description: 'Transcript model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Transcript) where?: Where<Transcript>,
  ): Promise<Count> {
    return this.transcriptRepository.count(where);
  }

  @get('/transcripts', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Array of Transcript model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Transcript, {includeRelations: false}),
            },
          },
        },
      },
    },
  })
  @authenticate('jwt')
  async find(
    @param.filter(Transcript, {exclude: 'include'}) filter?: Filter<Transcript>,
  ): Promise<Transcript[]> {
    return this.transcriptRepository.find(filter);
  }

  @patch('/transcripts')
  @response(200, {
    description: 'Transcript PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  @authenticate('jwt')
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Transcript, {partial: true}),
        },
      },
    })
    transcript: Transcript,
    @param.where(Transcript) where?: Where<Transcript>,
  ): Promise<Count> {
    return this.transcriptRepository.updateAll(transcript, where);
  }

  @get('/transcripts/{id}')
  @response(200, {
    description: 'Transcript model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Transcript, {includeRelations: false}),
      },
    },
  })
  @authenticate('jwt')
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Transcript, {exclude: 'where'})
    filter?: FilterExcludingWhere<Transcript>,
  ): Promise<Transcript> {
    return this.transcriptRepository.findById(id, filter);
  }

  @patch('/transcripts/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Transcript PATCH success',
      },
    },
  })
  @authenticate('jwt')
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Transcript, {partial: true}),
        },
      },
    })
    transcript: Transcript,
  ): Promise<void> {
    await this.transcriptRepository.updateById(id, transcript);
  }

  @put('/transcripts/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Transcript PUT success',
      },
    },
  })
  @authenticate('jwt')
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() transcript: Transcript,
  ): Promise<void> {
    await this.transcriptRepository.replaceById(id, transcript);
  }

  @del('/transcripts/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Transcript DELETE success',
      },
    },
  })
  @authenticate('jwt')
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.transcriptRepository.deleteById(id);
  }
}
