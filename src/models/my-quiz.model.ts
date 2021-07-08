import {Entity, model, property} from '@loopback/repository';

@model({settings: {strict: false}})
export class MyQuiz extends Entity {
  @property({
    type: 'string',
    required: true,
  })
  quizId: string;

  @property({
    type: 'string',
    required: true,
  })
  userId: string;

  @property({
    type: 'boolean',
    default: false,
  })
  permissionGranted?: boolean;

  @property({
    type: 'boolean',
    default: false,
  })
  completed?: boolean;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<MyQuiz>) {
    super(data);
  }
}

export interface MyQuizRelations {
  // describe navigational properties here
}

export type MyQuizWithRelations = MyQuiz & MyQuizRelations;
