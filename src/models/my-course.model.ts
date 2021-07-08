import {belongsTo, Entity, hasOne, model, property} from '@loopback/repository';
import {Course} from './course.model';
import {User} from './user.model';
@model({settings: {strict: false}})
export class MyCourse extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
    mongodb: {dataType: 'ObjectID'},
  })
  id: string;

  @property({
    type: 'string',
    required: true,
  })
  courseId: string;

  @property({
    type: 'string',
    required: true,
    mongodb: {dataType: 'ObjectID'},
  })
  userId: string;

  @property({
    type: 'string',
  })
  completed: string;

  @property({
    type: 'date',
  })
  completedDate?: Date;

  @property({
    type: 'string',
  })
  grade?: string;

  @belongsTo(() => User, {
    keyFrom: 'userId',
    keyTo: 'id',
  })
  owner?: User;

  @hasOne(() => Course, {
    keyFrom: 'courseId',
    keyTo: 'id',
  })
  course?: Course;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<MyCourse>) {
    super(data);
  }
}

export interface MyCourseRelations {
  // describe navigational properties here
}

export type MyCourseWithRelations = MyCourse & MyCourseRelations;
