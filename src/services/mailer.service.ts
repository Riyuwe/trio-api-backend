import { bind, BindingScope } from '@loopback/core';
import { createTransport } from 'nodemailer';
import { EmailTemplate, Exam, User } from '../models';
import { config } from './../config';
@bind({ scope: BindingScope.TRANSIENT })
export class MailerService {
  constructor() { }

  private static async setupTransporter() {
    return createTransport({
      host: process.env.MAIL_HOST,
      port: +process.env.MAIL_PORT!,
      secure: true,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  async sendCourseGradeMail(
    email: string,
    title: string,
    grade: string,
  ): Promise<any> {
    try {
      const transporter = await MailerService.setupTransporter();
      const emailTemplate = new EmailTemplate({
        from: `Woke Courses <${process.env.MAIL_FROM_ADDRESS}>`,
        to: email,
        subject: 'Your course on Woke Courses received a grade!',
        text: `
          You have received a grade for the course you completed on Woke Courses ${`\r\n`}
          Course: ${title} ${`\r\n`}
          Grade: ${grade} ${`\r\n`}
          Visit ${config.clientUrl}/courses/my to learn more.`,
      });

      return await transporter.sendMail(emailTemplate);
    } catch (error) {
      throw new Error(error);
    }
  }

  async sendExamGradeMail(
    email: string,
    title: string,
    grade: string,
  ): Promise<any> {
    try {
      const transporter = await MailerService.setupTransporter();
      const emailTemplate = new EmailTemplate({
        from: `Woke Courses <${process.env.MAIL_FROM_ADDRESS}>`,
        to: email,
        subject: 'Your exam on Woke Courses received a grade!',
        text: `
          You have received a grade for the exam you completed on Woke Courses ${`\r\n`}
          Exam: ${title} ${`\r\n`}
          Grade: ${grade} ${`\r\n`}
          Visit ${config.clientUrl}/exams/my to learn more.`,
      });

      return await transporter.sendMail(emailTemplate);
    } catch (error) {
      throw new Error(error);
    }
  }

  async sendContactMail(payload: ContactMail): Promise<any> {
    try {
      const transporter = await MailerService.setupTransporter();
      const emailTemplate = new EmailTemplate({
        to: 'info@trio.academy',
        from: payload.email,
        replyTo: payload.email,
        subject: 'Woke Courses - Contact form',
        text: `
          First name: ${payload.firstName} ${`\r\n`}
          Last name: ${payload.lastName} ${`\r\n`}
          Email: ${payload.email} ${`\r\n`}
          Message: ${payload.message}`,
      });

      return await transporter.sendMail(emailTemplate);
    } catch (error) {
      throw new Error(error);
    }
  }

  async sendExamRequestPermissionMail(
    adminEmails: Array<string>,
    user: User,
    exam: Exam,
  ): Promise<any> {
    try {
      const transporter = await MailerService.setupTransporter();
      const emailTemplate = new EmailTemplate({
        from: `${process.env.MAIL_FROM_ADDRESS}`,
        to: adminEmails.join(', '),
        replyTo: `${process.env.MAIL_FROM_ADDRESS}`,
        subject: `${user.firstName} ${user.lastName} requested access to ${exam.name}`,
        text: `
        Student has requested access to take the exam on Woke Courses ${`\r\n`}
        Student: ${user.firstName} ${user.lastName} - ${user.email} ${`\r\n`}
        Exam: ${exam.name} ${`\r\n`}
        Visit ${config.clientUrl}/admin/exam-permissions to approve it.`,
      });

      return await transporter.sendMail(emailTemplate);
    } catch (error) {
      throw new Error(error);
    }
  }
}

export interface ContactMail {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
}
