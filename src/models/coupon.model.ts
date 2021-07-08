import {Entity, model, property} from '@loopback/repository';

@model({settings: {strict: false}})
export class Coupon extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  code: string;

  @property({
    type: 'number',
    required: true,
  })
  discount: number;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Coupon>) {
    super(data);
  }
}

export interface CouponRelations {
  // describe navigational properties here
}

export type CouponWithRelations = Coupon & CouponRelations;
