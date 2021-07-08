import {SchemaObject} from '@loopback/rest';

const GenerateS3UrlSchema: SchemaObject = {
  type: 'object',
  required: ['fileName', 'fileType', 'examId'],
  properties: {
    fileName: {
      type: 'string',
    },
    fileType: {
      type: 'string',
    },
    examId: {
      type: 'string',
    },
  },
};

const UpdateEssayUrlSchema: SchemaObject = {
  type: 'object',
  required: ['url', 'examId'],
  properties: {
    url: {
      type: 'string',
    },
    examId: {
      type: 'string',
    },
  },
};

const UpdateQuestionsAnswersSchema: SchemaObject = {
  type: 'object',
  required: ['answers', 'examId'],
  properties: {
    answers: {
      type: 'string',
    },
    examId: {
      type: 'string',
    },
  },
};

const SubmitExamSchema: SchemaObject = {
  type: 'object',
  required: ['questions', 'examId'],
  properties: {
    questions: {
      type: 'array',
    },
    examId: {
      type: 'string',
    },
  },
};

export const GenerateS3UrlRequestBody = {
  description: 'The input of generateS3PresignedURL function',
  required: true,
  content: {
    'application/json': {schema: GenerateS3UrlSchema},
  },
};

export const UpdateEssayUrlRequestBody = {
  description: 'The input of update essay URL function',
  required: true,
  content: {
    'application/json': {schema: UpdateEssayUrlSchema},
  },
};

export const UpdateQuestionsAnswersRequestBody = {
  description: "The input of update question's answers function",
  required: true,
  content: {
    'application/json': {schema: UpdateQuestionsAnswersSchema},
  },
};

export const SubmitExamRequestBody = {
  description: 'The input of submit exam function',
  required: true,
  content: {
    'application/json': {schema: SubmitExamSchema},
  },
};
