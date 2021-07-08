import {Entity, model, property} from '@loopback/repository';

@model({settings: {strict: false}})
export class Exam extends Entity {
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
  type: string;

  @property({
    type: 'string',
  })
  description?: string;

  @property({
    type: 'string',
  })
  imageUrl?: string;

  @property({
    type: 'array',
    itemType: 'object',
  })
  quiz?: Array<Object>;

  @property({
    type: 'number',
  })
  quizLength?: number;

  @property({
    type: 'string',
  })
  essayUrl?: string;

  @property({
    type: 'boolean',
    default: false,
  })
  hidden?: boolean;

  @property({
    type: 'date',
    required: true,
  })
  dateCreated?: Date;

  @property({
    type: 'string',
  })
  examQuestions?: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Exam>) {
    super(data);
  }
}

export interface ExamRelations {
  // describe navigational properties here
}

export type ExamWithRelations = Exam & ExamRelations;
