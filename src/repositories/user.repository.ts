import {Getter, inject} from '@loopback/core';
import {
  DefaultCrudRepository,
  HasManyRepositoryFactory,
  HasManyThroughRepositoryFactory,
  HasOneRepositoryFactory,
  repository,
} from '@loopback/repository';
import {MongoDataSource} from '../datasources';
import {RoleMapping, User} from '../models';
import {MyCourse} from './../models/my-course.model';
import {MyExam} from './../models/my-exam.model';
import {Role} from './../models/role.model';
import {Transcript} from './../models/transcript.model';
import {UserCredentials} from './../models/user-credentials.model';
import {MyCourseRepository} from './my-course.repository';
import {MyExamRepository} from './my-exam.repository';
import {RoleMappingRepository} from './role-mapping.repository';
import {RoleRepository} from './role.repository';
import {TranscriptRepository} from './transcript.repository';
import {UserCredentialsRepository} from './user-credentials.repository';

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id
> {
  public readonly userCredentials: HasOneRepositoryFactory<
    UserCredentials,
    typeof User.prototype.id
  >;

  public readonly myCourses: HasManyRepositoryFactory<
    MyCourse,
    typeof User.prototype.id
  >;

  public readonly myExams: HasManyRepositoryFactory<
    MyExam,
    typeof User.prototype.id
  >;

  public readonly transcripts: HasManyRepositoryFactory<
    Transcript,
    typeof User.prototype.id
  >;

  public readonly roles: HasManyThroughRepositoryFactory<
    Role,
    typeof Role.prototype.id,
    RoleMapping,
    typeof User.prototype.id
  >;

  constructor(
    @inject('datasources.db') dataSource: MongoDataSource,
    @repository.getter('UserCredentialsRepository')
    protected userCredentialsRepositoryGetter: Getter<UserCredentialsRepository>,
    @repository.getter('RoleMappingRepository')
    protected roleMappingpositoryGetter: Getter<RoleMappingRepository>,
    @repository.getter('RoleRepository')
    protected roleRepositoryGetter: Getter<RoleRepository>,
    @repository.getter('MyCourseRepository')
    protected myCourseRepositoryGetter: Getter<MyCourseRepository>,
    @repository.getter('MyExamRepository')
    protected myExamRepositoryGetter: Getter<MyExamRepository>,
    @repository.getter('TranscriptRepository')
    protected transcriptRepositoryGetter: Getter<TranscriptRepository>,
  ) {
    super(User, dataSource);
    this.userCredentials = this.createHasOneRepositoryFactoryFor(
      'userCredentials',
      userCredentialsRepositoryGetter,
    );

    this.registerInclusionResolver(
      'userCredentials',
      this.userCredentials.inclusionResolver,
    );

    this.roles = this.createHasManyThroughRepositoryFactoryFor(
      'roles',
      roleRepositoryGetter,
      roleMappingpositoryGetter,
    );

    this.registerInclusionResolver('roles', this.roles.inclusionResolver);

    this.myCourses = this.createHasManyRepositoryFactoryFor(
      'myCourses',
      myCourseRepositoryGetter,
    );

    this.registerInclusionResolver(
      'myCourses',
      this.myCourses.inclusionResolver,
    );

    this.myExams = this.createHasManyRepositoryFactoryFor(
      'myExams',
      myExamRepositoryGetter,
    );

    this.registerInclusionResolver('myExams', this.myExams.inclusionResolver);

    this.transcripts = this.createHasManyRepositoryFactoryFor(
      'transcripts',
      transcriptRepositoryGetter,
    );

    this.registerInclusionResolver(
      'transcripts',
      this.transcripts.inclusionResolver,
    );
  }

  async findCredentials(
    userId: typeof User.prototype.id,
  ): Promise<UserCredentials | undefined> {
    try {
      return await this.userCredentials(userId).get();
    } catch (err) {
      if (err.code === 'ENTITY_NOT_FOUND') {
        return undefined;
      }
      throw err;
    }
  }
}

export type Credentials = {
  email: string;
  password: string;
};

export type UpdateUserData = {
  firstName: string;
  lastName: string;
  PhoneNumber: string;
};

export type ChangePassData = {
  oldPassword: string;
  newPassword: string;
};

export type GradingCourse = {
  myCourseId: string;
  grade: string;
};

export type GradingExam = {
  myExamId: string;
  grade: string;
};

export type S3SignedUrl = {
  fileName: string;
  fileType: string;
};

export type PurchaseCourseData = {
  stripePayload: {
    id: string;
  };
  courses: Array<string>;
  couponCode?: string;
};

export type PurchaseTranscriptData = {
  stripePayload: {
    id: string;
  };
};

export type SendMailData = {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
};

export type DonateMoneyData = {
  stripePayload: {
    id: string;
  };
  amount: number;
  message: string;
};
