import {Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  HasOneRepositoryFactory,
  repository,
} from '@loopback/repository';
import {MongoDataSource} from '../datasources';
import {Course, MyCourse, MyCourseRelations, User} from '../models';
import {CourseRepository} from './course.repository';
import {UserRepository} from './user.repository';

export class MyCourseRepository extends DefaultCrudRepository<
  MyCourse,
  typeof MyCourse.prototype.id,
  MyCourseRelations
> {
  public readonly course: HasOneRepositoryFactory<
    Course,
    typeof MyCourse.prototype.id
  >;

  public readonly owner: BelongsToAccessor<User, typeof MyCourse.prototype.id>;
  constructor(
    @inject('datasources.db') dataSource: MongoDataSource,
    @repository.getter('CourseRepository')
    protected courseRepositoryGetter: Getter<CourseRepository>,
    @repository.getter('UserRepository')
    protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(MyCourse, dataSource);

    this.course = this.createHasOneRepositoryFactoryFor(
      'course',
      courseRepositoryGetter,
    );
    this.registerInclusionResolver('course', this.course.inclusionResolver);
    this.owner = this.createBelongsToAccessorFor('owner', userRepositoryGetter);
    this.registerInclusionResolver('owner', this.owner.inclusionResolver);
  }
}
