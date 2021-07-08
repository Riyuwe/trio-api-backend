import {Entity, model, property} from '@loopback/repository';

@model({settings: {strict: false}})
export class Transcript extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
    mongodb: {dataType: 'ObjectID'},
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  userId: string;

  @property({
    type: 'date',
  })
  date?: Date;

  @property({
    type: 'string',
    required: true,
  })
  content: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Transcript>) {
    super(data);
  }
}

export interface TranscriptRelations {
  // describe navigational properties here
}

export type TranscriptWithRelations = Transcript & TranscriptRelations;
