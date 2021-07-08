import {Getter, inject} from '@loopback/core';
import {
  DefaultCrudRepository,
  HasManyRepositoryFactory,
  repository,
} from '@loopback/repository';
import {MongoDataSource} from '../datasources';
import {Role, RoleMapping, RoleRelations} from '../models';
import {RoleMappingRepository} from './role-mapping.repository';

export class RoleRepository extends DefaultCrudRepository<
  Role,
  typeof Role.prototype.id,
  RoleRelations
> {
  public readonly users: HasManyRepositoryFactory<
    RoleMapping,
    typeof Role.prototype.id
  >;

  constructor(
    @inject('datasources.db') dataSource: MongoDataSource,
    @repository.getter('RoleMappingRepository')
    protected roleMappingRepositoryGetter: Getter<RoleMappingRepository>,
  ) {
    super(Role, dataSource);

    this.users = this.createHasManyRepositoryFactoryFor(
      'users',
      roleMappingRepositoryGetter,
    );

    this.registerInclusionResolver('users', this.users.inclusionResolver);
  }
}
