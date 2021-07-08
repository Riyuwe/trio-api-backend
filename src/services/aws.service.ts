import { BindingScope, injectable } from '@loopback/core';
import AWS from 'aws-sdk';
import { config } from './../config';

@injectable({ scope: BindingScope.TRANSIENT })
export class AwsService {
  constructor() { }

  /*
   * Add service methods here
   */

  private static async setupTransporter() {
    return new AWS.S3({
      accessKeyId: config.aws.accessId,
      secretAccessKey: config.aws.secretKey,
      region: config.aws.region,
    });
  }

  async getSignedUrl(params: Object): Promise<any> {
    try {
      const transporter = await AwsService.setupTransporter();
      return transporter.getSignedUrl('putObject', params);
    } catch (error) {
      throw new Error(error);
    }
  }
}
