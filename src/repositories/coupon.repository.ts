import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongoDataSource} from '../datasources';
import {Coupon, CouponRelations} from '../models';

export class CouponRepository extends DefaultCrudRepository<
  Coupon,
  typeof Coupon.prototype.id,
  CouponRelations
> {
  constructor(@inject('datasources.db') dataSource: MongoDataSource) {
    super(Coupon, dataSource);
  }
}
