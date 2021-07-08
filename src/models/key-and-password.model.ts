import {Entity, model, property} from '@loopback/repository';

@model({settings: {strict: false}})
export class KeyAndPassword extends Entity {
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
  resetKey: string;

  @property({
    type: 'string',
    required: true,
  })
  password: string;

  @property({
    type: 'string',
    required: true,
  })
  confirmPassword: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<KeyAndPassword>) {
    super(data);
  }
}

export interface KeyAndPasswordRelations {
  // describe navigational properties here
}

export type KeyAndPasswordWithRelations = KeyAndPassword &
  KeyAndPasswordRelations;
