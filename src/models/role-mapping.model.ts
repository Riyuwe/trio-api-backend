import {belongsTo, Entity, hasOne, model, property} from '@loopback/repository';
import {Role} from './role.model';
import {User, UserRelations} from './user.model';

@model({settings: {strict: false}})
export class RoleMapping extends Entity {
  @property({
    type: 'string',
    id: true,
    mongodb: {dataType: 'ObjectID'},
  })
  id: string;

  @property({
    type: 'string',
    required: true,
  })
  principalType: string;

  @property({
    type: 'string',
    required: true,
  })
  principalId: string;

  @belongsTo(() => Role)
  roleId?: string;

  @hasOne(() => User, {
    keyFrom: 'principalId',
    keyTo: 'id',
  })
  owner?: User;

  constructor(data?: Partial<RoleMapping>) {
    super(data);
  }
}

export interface RoleMappingRelations {
  // describe navigational properties here
  user?: UserRelations;
}

export type RoleMappingWithRelations = RoleMapping & RoleMappingRelations;
