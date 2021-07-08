import {User} from '@loopback/authentication-jwt';
import {belongsTo, Entity, model, property} from '@loopback/repository';
import {Exam} from './exam.model';

@model({
  settings: {
    strict: false,
  },
})
export class MyExam extends Entity {
  @property({
    type: 'string',
    id: true,
    mongodb: {dataType: 'ObjectID'},
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  examId?: string;

  @property({
    type: 'string',
    required: true,
  })
  userId: string;

  @property({
    type: 'boolean',
    required: true,
    default: false,
  })
  permissionGranted?: boolean;

  @property({
    type: 'date',
  })
  date?: Date;

  @property({
    type: 'boolean',
    required: true,
    default: false,
  })
  quizCompleted?: boolean;

  @property({
    type: 'date',
  })
  quizCompletedDate?: Date;

  @property({
    type: 'number',
  })
  quizCorrectAnswers?: number;

  @property({
    type: 'number',
  })
  quizLength?: number;

  @property({
    type: 'boolean',
    required: true,
    default: false,
  })
  essayCompleted: boolean;

  @property({
    type: 'date',
  })
  essayCompletedDate: Date;

  @property({
    type: 'string',
  })
  essayUrl?: string;

  @property({
    type: 'string',
  })
  examQuestionsAnswers?: string;

  @property({
    type: 'string',
  })
  grade?: string;

  @belongsTo(() => User, {
    keyFrom: 'userId',
    keyTo: 'id',
  })
  owner?: User;

  @belongsTo(() => Exam, {
    keyFrom: 'examId',
    keyTo: 'id',
  })
  exam?: Exam;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<MyExam>) {
    super(data);
  }
}

export interface MyExamRelations {
  // describe navigational properties here
}

export type MyExamWithRelations = MyExam & MyExamRelations;
