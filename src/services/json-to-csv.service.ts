import {/* inject, */ BindingScope, injectable} from '@loopback/core';
import {User} from '../models';
const Json2csvParser = require('json2csv').Parser;

@injectable({scope: BindingScope.TRANSIENT})
export class JsonToCsvService {
  constructor(/* Add @inject to inject parameters */) {}

  /*
   * Add service methods here
   */

  private static async setupParser(fields: Array<Object>) {
    return new Json2csvParser({fields});
  }

  async exportUsers(users: User[]): Promise<any> {
    try {
      const fields = [
        {label: 'Id', value: 'id'},
        {label: 'Title', value: 'title'},
        {label: 'First Name', value: 'firstName'},
        {label: 'Last Name', value: 'lastName'},
        {label: 'Full Name', value: 'fullName'},
        {label: 'Company', value: 'Company'},
        {label: 'Street', value: 'Street'},
        {label: 'City', value: 'City'},
        {label: 'State', value: 'State'},
        {label: 'Postal Code', value: 'PostalCode'},
        {label: 'Country', value: 'Country'},
        {label: 'Fax', value: 'Fax'},
        {label: 'Phone', value: 'PhoneNumber'},
        {label: 'Activity Time', value: 'DateCreated'},
        {label: 'Currency', value: 'Currency'},
        {label: 'Date Of Birth', value: 'DateOfBirth'},
        {label: 'EMail', value: 'email'},
        {label: 'Priority', value: 'Priority'},
        {label: 'Private', value: 'Private'},
        {label: 'Web Page', value: 'WebPage'},
        {label: 'Email Opt Out', value: 'EmailOptOut'},
      ];

      const parser = await JsonToCsvService.setupParser(fields);
      return parser.parse(users);
    } catch (error) {
      throw new Error(error);
    }
  }
}
