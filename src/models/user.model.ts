import {Entity, hasMany, hasOne, model, property} from '@loopback/repository';
import {MyCourse} from './my-course.model';
import {MyExam} from './my-exam.model';
import {RoleMapping} from './role-mapping.model';
import {Role, RoleRelations} from './role.model';
import {Transcript} from './transcript.model';
import {UserCredentials} from './user-credentials.model';
@model({
  settings: {
    hiddenProperties: ['password'],
    indexes: {
      uniqueEmail: {
        keys: {
          email: 1,
        },
        options: {
          unique: true,
        },
      },
    },
  },
})
export class User extends Entity {
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
  email: string;

  @property({
    type: 'string',
    required: true,
  })
  firstName: string;

  @property({
    type: 'string',
    required: true,
  })
  lastName: string;

  @property({
    type: 'string',
  })
  PhoneNumber: string;

  @property({
    type: 'date',
    required: true,
  })
  DateCreated: Date;

  @property({
    type: 'string',
    required: true,
  })
  versalUserID: string;

  // relations
  @hasOne(() => UserCredentials)
  userCredentials: UserCredentials;

  @hasMany(() => MyCourse, {keyTo: 'userId'})
  myCourses?: MyCourse[];

  @hasMany(() => MyExam, {keyTo: 'userId'})
  myExams?: MyExam[];

  @hasMany(() => Transcript, {keyTo: 'userId'})
  transcripts?: Transcript[];

  @hasMany(() => Role, {
    through: {
      model: () => RoleMapping,
      keyFrom: 'principalId',
      keyTo: 'roleId',
    },
  })
  roles?: Role[];
}

export interface UserRelations {
  // describe navigational properties here
  roles?: RoleRelations;
}

export type UserWithRelations = User & UserRelations;
