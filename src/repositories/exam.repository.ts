import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongoDataSource} from '../datasources';
import {Exam, ExamRelations} from '../models';

export class ExamRepository extends DefaultCrudRepository<
  Exam,
  typeof Exam.prototype.id,
  ExamRelations
> {
  constructor(@inject('datasources.db') dataSource: MongoDataSource) {
    super(Exam, dataSource);
  }
}

export type SubmitExamData = {
  examId: string;
  questions: Array<string>;
};
