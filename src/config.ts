require('dotenv').config();

export const config = {
  clientUrl: process.env.CLIENT_URL,
  versal: {
    SID: process.env.VERSAL_SID,
    OrgID: process.env.VERSAL_ORGID,
  },
  database: {
    url: process.env.DB_URL ?? '',
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: process.env.DB_PORT ?? 27017,
    user: process.env.DB_USER ?? '',
    password: process.env.DB_PASS ?? '',
    name: process.env.DB_NAME ?? 'trioDB',
  },
  aws: {
    accessId: process.env.AWS_ACCESS_ID ?? '',
    secretKey: process.env.AWS_SECRET_KEY ?? '',
    region: process.env.AWS_REGION ?? 'us-east-1',
  },
  stripe: {
    testKey: process.env.STRIPE_TEST_API_KEY,
    prodKey: process.env.STRIPE_PROD_API_KEY,
  },
  price: {
    transcript: 12,
  },
};
