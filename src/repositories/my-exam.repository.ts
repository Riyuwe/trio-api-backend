import {Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  repository,
} from '@loopback/repository';
import {MongoDataSource} from '../datasources';
import {Exam, MyExam, MyExamRelations, User} from '../models';
import {ExamRepository} from './exam.repository';
import {UserRepository} from './user.repository';

export class MyExamRepository extends DefaultCrudRepository<
  MyExam,
  typeof MyExam.prototype.id,
  MyExamRelations
> {
  public readonly exam: BelongsToAccessor<Exam, typeof MyExam.prototype.id>;
  public readonly owner: BelongsToAccessor<User, typeof MyExam.prototype.id>;
  constructor(
    @inject('datasources.db') dataSource: MongoDataSource,
    @repository.getter('ExamRepository')
    protected examRepositoryGetter: Getter<ExamRepository>,
    @repository.getter('UserRepository')
    protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(MyExam, dataSource);

    this.exam = this.createBelongsToAccessorFor('exam', examRepositoryGetter);
    this.registerInclusionResolver('exam', this.exam.inclusionResolver);

    this.owner = this.createBelongsToAccessorFor('owner', userRepositoryGetter);
    this.registerInclusionResolver('owner', this.owner.inclusionResolver);
  }
}

export type ExamS3SignedUrl = {
  fileName: string;
  fileType: string;
  examId: string;
};

export type UpdateEssayUrl = {
  url: string;
  examId: string;
};

export type UpdateQuestionsAnswers = {
  answers: string;
  examId: string;
};
