import { get, response } from '@loopback/rest';
export class PingController {
  constructor() { }

  @get('/')
  @response(200)
  ping(): object {
    // Reply with a greeting, the current time, the url, and request headers
    return {
      message: 'WokeCourses API is running',
      date: new Date(),
      status: 200,
    };
  }
}
