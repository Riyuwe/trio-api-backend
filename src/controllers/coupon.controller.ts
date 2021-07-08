import {authenticate, TokenService} from '@loopback/authentication';
import {TokenServiceBindings} from '@loopback/authentication-jwt';
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
import {Coupon} from '../models';
import {CouponRepository} from '../repositories';
import {OPERATION_SECURITY_SPEC} from './../utils/security-specs';

export class CouponController {
  constructor(
    @repository(CouponRepository)
    public couponRepository: CouponRepository,
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
  ) {}

  @post('/coupons', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Coupon model instance',
        content: {'application/json': {schema: getModelSchemaRef(Coupon)}},
      },
    },
  })
  @authenticate('jwt')
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Coupon, {
            title: 'NewCoupon',
            exclude: ['id'],
          }),
        },
      },
    })
    coupon: Omit<Coupon, 'id'>,
  ): Promise<Coupon> {
    return this.couponRepository.create(coupon);
  }

  @get('/coupons/count')
  @response(200, {
    description: 'Coupon model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Coupon) where?: Where<Coupon>): Promise<Count> {
    return this.couponRepository.count(where);
  }

  @get('/coupons', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Array of Coupon model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Coupon, {includeRelations: false}),
            },
          },
        },
      },
    },
  })
  @authenticate('jwt')
  async find(
    @param.filter(Coupon, {exclude: 'include'}) filter?: Filter<Coupon>,
  ): Promise<Coupon[]> {
    return this.couponRepository.find(filter);
  }

  @patch('/coupons', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Coupon PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  @authenticate('jwt')
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Coupon, {partial: true}),
        },
      },
    })
    coupon: Coupon,
    @param.where(Coupon) where?: Where<Coupon>,
  ): Promise<Count> {
    return this.couponRepository.updateAll(coupon, where);
  }

  @get('/coupons/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Coupon model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Coupon, {includeRelations: false}),
          },
        },
      },
    },
  })
  @authenticate('jwt')
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Coupon, {exclude: 'where'})
    filter?: FilterExcludingWhere<Coupon>,
  ): Promise<Coupon> {
    return this.couponRepository.findById(id, filter);
  }

  @patch('/coupons/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Coupon PATCH success',
      },
    },
  })
  @authenticate('jwt')
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Coupon, {partial: true}),
        },
      },
    })
    coupon: Coupon,
  ): Promise<void> {
    await this.couponRepository.updateById(id, coupon);
  }

  @put('/coupons/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Coupon PUT success',
      },
    },
  })
  @authenticate('jwt')
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() coupon: Coupon,
  ): Promise<void> {
    await this.couponRepository.replaceById(id, coupon);
  }

  @del('/coupons/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Coupon DELETE success',
      },
    },
  })
  @authenticate('jwt')
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.couponRepository.deleteById(id);
  }

  // Validates coupon code
  @post('/validate-coupon-code', {
    responses: {
      '200': {
        description: 'Validates coupon code',
        required: true,
        content: {
          'application/json': {
            schema: {couponCode: String},
          },
        },
      },
    },
  })
  async validateCouponCode(
    @param.query.string('couponCode', {required: true})
    couponCode: string,
  ): Promise<Coupon> {
    try {
      const coupon = await this.couponRepository.findOne({
        where: {code: couponCode},
      });

      if (!coupon) {
        throw new Error('Invalid coupon');
      }

      return coupon;
    } catch (error) {
      throw new HttpErrors.NotFound('Invalid coupon');
    }
  }
}
