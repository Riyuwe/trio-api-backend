import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongoDataSource} from '../datasources';
import {Course, CourseRelations} from '../models';

export class CourseRepository extends DefaultCrudRepository<
  Course,
  typeof Course.prototype.id,
  CourseRelations
> {
  constructor(@inject('datasources.db') dataSource: MongoDataSource) {
    super(Course, dataSource);
  }
}
