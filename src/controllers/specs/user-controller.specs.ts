import {SchemaObject} from '@loopback/rest';

const CredentialsSchema: SchemaObject = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
    },
    password: {
      type: 'string',
    },
  },
};

const UpdateProfileSchema: SchemaObject = {
  type: 'object',
  required: ['firstName', 'lastName'],
  properties: {
    firstName: {
      type: 'string',
    },
    lastName: {
      type: 'string',
    },
    PhoneNumber: {
      type: 'string',
    },
  },
};

const UpdatePasswordSchema: SchemaObject = {
  type: 'object',
  required: ['oldPassword', 'newPassword'],
  properties: {
    oldPassword: {
      type: 'string',
    },
    newPassword: {
      type: 'string',
    },
  },
};

const GradeCourseSchema: SchemaObject = {
  type: 'object',
  required: ['myCourseId', 'grade'],
  properties: {
    myCourseId: {
      type: 'string',
    },
    grade: {
      type: 'string',
    },
  },
};

const GradeExamSchema: SchemaObject = {
  type: 'object',
  required: ['myExamId', 'grade'],
  properties: {
    myExamId: {
      type: 'string',
    },
    grade: {
      type: 'string',
    },
  },
};

const GenerateS3UrlSchema: SchemaObject = {
  type: 'object',
  required: ['fileName', 'fileType'],
  properties: {
    fileName: {
      type: 'string',
    },
    fileType: {
      type: 'string',
    },
  },
};

const PurchaseCourseSchema: SchemaObject = {
  type: 'object',
  required: ['courses'],
  properties: {
    stripePayload: {
      type: 'object',
    },
    courses: {
      type: 'array',
    },
    couponCode: {
      type: 'string',
    },
  },
};

const PurchaseTranscriptSchema: SchemaObject = {
  type: 'object',
  required: ['stripePayload'],
  properties: {
    stripePayload: {
      type: 'object',
    },
  },
};

const SendMailSchema: SchemaObject = {
  type: 'object',
  required: ['firstName', 'lastName', 'email', 'message'],
  properties: {
    firstName: {
      type: 'string',
    },
    lastName: {
      type: 'string',
    },
    email: {
      type: 'string',
    },
    message: {
      type: 'string',
    },
  },
};

const DonateMoneySchema: SchemaObject = {
  type: 'object',
  required: ['stripePayload', 'amount', 'message'],
  properties: {
    stripePayload: {
      type: 'object',
    },
    amount: {
      type: 'number',
    },
    message: {
      type: 'string',
    },
  },
};
export const CredentialsRequestBody = {
  description: 'The input of login function',
  required: true,
  content: {
    'application/json': {schema: CredentialsSchema},
  },
};

export const PasswordResetRequestBody = {
  description: 'The input of password reset function',
  required: true,
  content: {
    'application/json': {schema: CredentialsSchema},
  },
};

export const GradeCourseRequestBody = {
  description: 'The input of grade user course function',
  required: true,
  content: {
    'application/json': {schema: GradeCourseSchema},
  },
};

export const GradeExamRequestBody = {
  description: 'The input of grade user exam function',
  required: true,
  content: {
    'application/json': {schema: GradeExamSchema},
  },
};

export const UpdatePasswordRequestBody = {
  description: 'The input of password update function',
  required: true,
  content: {
    'application/json': {schema: UpdatePasswordSchema},
  },
};

export const UpdateProfileRequestBody = {
  description: 'The input of update profile',
  required: true,
  content: {
    'application/json': {schema: UpdateProfileSchema},
  },
};

export const GenerateS3UrlRequestBody = {
  description: 'The input of generateS3PresignedURL function',
  required: true,
  content: {
    'application/json': {schema: GenerateS3UrlSchema},
  },
};

export const PurchaseCourseRequestBody = {
  description: 'The input of purchase courses function',
  required: true,
  content: {
    'application/json': {schema: PurchaseCourseSchema},
  },
};

export const PurchaseTranscriptRequestBody = {
  description: 'The input of purchase transcript function',
  required: true,
  content: {
    'application/json': {schema: PurchaseTranscriptSchema},
  },
};

export const SendMailRequestBody = {
  description: 'The input of send mail function',
  required: true,
  content: {
    'application/json': {schema: SendMailSchema},
  },
};

export const DonateMoneyRequestBody = {
  description: 'The input of donate money function',
  required: true,
  content: {
    'application/json': {schema: DonateMoneySchema},
  },
};

export const UserProfileSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: {type: 'string'},
    email: {type: 'string'},
    name: {type: 'string'},
  },
};
