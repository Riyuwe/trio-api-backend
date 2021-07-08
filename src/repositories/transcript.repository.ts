import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongoDataSource} from '../datasources';
import {Transcript, TranscriptRelations} from '../models';

export class TranscriptRepository extends DefaultCrudRepository<
  Transcript,
  typeof Transcript.prototype.id,
  TranscriptRelations
> {
  constructor(@inject('datasources.db') dataSource: MongoDataSource) {
    super(Transcript, dataSource);
  }
}
