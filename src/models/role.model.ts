import {Entity, hasMany, model, property} from '@loopback/repository';
import {RoleMapping} from './role-mapping.model';

@model({settings: {strict: false}})
export class Role extends Entity {
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
  name: string;

  @property({
    type: 'date',
    required: true,
  })
  created: Date;

  @property({
    type: 'date',
    required: true,
  })
  modified?: Date;

  @hasMany(() => RoleMapping, {keyTo: 'roleId'})
  users?: RoleMapping[];

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Role>) {
    super(data);
  }
}

export interface RoleRelations {
  // describe navigational properties here
}

export type RoleWithRelations = Role & RoleRelations;
