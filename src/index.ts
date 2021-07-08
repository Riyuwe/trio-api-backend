import {ApplicationConfig, TrioApp} from './application';
require('dotenv').config();

export * from './application';

export async function main(options: ApplicationConfig = {}) {
  const app = new TrioApp(options);

  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log('Browse your REST API at %s', `${url}/explorer`);

  return app;
}

if (require.main === module) {
  // Run the application
  const config = {
    rest: {
      basePath: '/api',
      port: +(process.env.PORT ?? 3000),
      protocol: 'http',
      key: '',
      cert: '',
      host: process.env.HOST ?? '0.0.0.0',
      ciphers: [],
      cors: {
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        preflightContinue: false,
        optionsSuccessStatus: 200,
        maxAge: 86400,
        credentials: true,
        allowedHeaders: '*',
        exposedHeaders: '*',
      },
      // The `gracePeriodForClose` provides a graceful close for http/https
      // servers with keep-alive clients. The default value is `Infinity`
      // (don't force-close). If you want to immediately destroy all sockets
      // upon stop, set its value to `0`.
      // See https://www.npmjs.com/package/stoppable
      gracePeriodForClose: 5000, // 5 seconds
      openApiSpec: {
        // useful when used with OpenAPI-to-GraphQL to locate your application
        setServersFromRequest: true,
      },
    },
  };

  main(config).catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
