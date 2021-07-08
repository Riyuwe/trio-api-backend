import {Getter, inject} from '@loopback/core';
import {
  DefaultCrudRepository,
  HasOneRepositoryFactory,
  repository,
} from '@loopback/repository';
import {MongoDataSource} from '../datasources';
import {RoleMapping, RoleMappingRelations, User} from '../models';
import {UserRepository} from './user.repository';

export class RoleMappingRepository extends DefaultCrudRepository<
  RoleMapping,
  typeof RoleMapping.prototype.id,
  RoleMappingRelations
> {
  public readonly owner: HasOneRepositoryFactory<
    User,
    typeof RoleMapping.prototype.id
  >;

  constructor(
    @inject('datasources.db') dataSource: MongoDataSource,
    @repository.getter('UserRepository')
    protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(RoleMapping, dataSource);

    this.owner = this.createHasOneRepositoryFactoryFor(
      'owner',
      userRepositoryGetter,
    );

    this.registerInclusionResolver('owner', this.owner.inclusionResolver);
  }
}
