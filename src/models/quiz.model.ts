import {Entity, model, property} from '@loopback/repository';

@model({settings: {strict: false}})
export class Quiz extends Entity {
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
  name: string;

  @property({
    type: 'string',
    required: true,
  })
  slug: string;

  @property({
    type: 'number',
    required: true,
  })
  length: number;

  @property({
    type: 'string',
    required: true,
  })
  description: string;

  @property({
    type: 'string',
    required: true,
  })
  imageUrl: string;

  @property({
    type: 'array',
    itemType: 'string',
    required: true,
  })
  questions: string[];

  @property({
    type: 'string',
    required: true,
  })
  documentUrl: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Quiz>) {
    super(data);
  }
}

export interface QuizRelations {
  // describe navigational properties here
}

export type QuizWithRelations = Quiz & QuizRelations;
