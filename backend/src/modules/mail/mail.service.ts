import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT', 587);
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      this.logger.log(`Mail transporter configured: ${host}:${port}`);
    } else {
      this.logger.warn(
        'SMTP not configured — emails will be logged to console only',
      );
    }
  }

  async sendEnquiryNotification(enquiry: {
    name: string;
    email: string;
    phone?: string;
    suburb?: string;
    projectType?: string;
    budgetRange?: string;
    message: string;
    stoneName?: string;
  }) {
    const mailTo = this.configService.get<string>(
      'MAIL_TO',
      'info@pvstone.com.au',
    );
    const mailFrom = this.configService.get<string>(
      'MAIL_FROM',
      '"PVStone" <noreply@pvstone.com.au>',
    );

    const subject = enquiry.stoneName
      ? `New Stone Enquiry: ${enquiry.stoneName} — from ${enquiry.name}`
      : `New Contact Enquiry from ${enquiry.name}`;

    const html = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1c1917; padding: 24px 32px;">
          <h1 style="color: #bf9b30; margin: 0; font-size: 20px;">PVStone</h1>
          <p style="color: #a8a29e; margin: 4px 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">New Enquiry Received</p>
        </div>
        <div style="padding: 32px; background: #fff; border: 1px solid #e7e5e4;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #78716c; width: 120px; vertical-align: top;">Name</td><td style="padding: 8px 0; color: #1c1917; font-weight: 500;">${enquiry.name}</td></tr>
            <tr><td style="padding: 8px 0; color: #78716c;">Email</td><td style="padding: 8px 0;"><a href="mailto:${enquiry.email}" style="color: #bf9b30;">${enquiry.email}</a></td></tr>
            ${enquiry.phone ? `<tr><td style="padding: 8px 0; color: #78716c;">Phone</td><td style="padding: 8px 0; color: #1c1917;">${enquiry.phone}</td></tr>` : ''}
            ${enquiry.suburb ? `<tr><td style="padding: 8px 0; color: #78716c;">Suburb</td><td style="padding: 8px 0; color: #1c1917;">${enquiry.suburb}</td></tr>` : ''}
            ${enquiry.projectType ? `<tr><td style="padding: 8px 0; color: #78716c;">Project</td><td style="padding: 8px 0; color: #1c1917;">${enquiry.projectType}</td></tr>` : ''}
            ${enquiry.budgetRange ? `<tr><td style="padding: 8px 0; color: #78716c;">Budget</td><td style="padding: 8px 0; color: #1c1917;">${enquiry.budgetRange}</td></tr>` : ''}
            ${enquiry.stoneName ? `<tr><td style="padding: 8px 0; color: #78716c;">Stone</td><td style="padding: 8px 0; color: #1c1917; font-weight: 500;">${enquiry.stoneName}</td></tr>` : ''}
          </table>
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e7e5e4;">
            <p style="color: #78716c; margin: 0 0 8px; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Message</p>
            <p style="color: #1c1917; line-height: 1.6; white-space: pre-wrap;">${enquiry.message}</p>
          </div>
        </div>
        <div style="padding: 16px 32px; background: #fafaf9; text-align: center;">
          <p style="color: #a8a29e; font-size: 12px; margin: 0;">Reply directly to this email to respond to ${enquiry.name}</p>
        </div>
      </div>
    `;

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: mailFrom,
          to: mailTo,
          replyTo: enquiry.email,
          subject,
          html,
        });
        this.logger.log(`Enquiry email sent to ${mailTo}`);
      } catch (error) {
        this.logger.error(`Failed to send email: ${error.message}`);
      }
    } else {
      this.logger.log('--- EMAIL (console fallback) ---');
      this.logger.log(`To: ${mailTo}`);
      this.logger.log(`Subject: ${subject}`);
      this.logger.log(`From: ${enquiry.name} <${enquiry.email}>`);
      this.logger.log(`Message: ${enquiry.message}`);
      this.logger.log('--- END EMAIL ---');
    }
  }

  async sendAutoReply(toEmail: string, toName: string) {
    if (!this.transporter) return;

    const mailFrom = this.configService.get<string>(
      'MAIL_FROM',
      '"PVStone" <noreply@pvstone.com.au>',
    );

    try {
      await this.transporter.sendMail({
        from: mailFrom,
        to: toEmail,
        subject: 'Thank you for your enquiry — PVStone',
        html: `
          <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #1c1917; padding: 24px 32px;">
              <h1 style="color: #bf9b30; margin: 0; font-size: 20px;">PVStone</h1>
            </div>
            <div style="padding: 32px; background: #fff; border: 1px solid #e7e5e4;">
              <p style="color: #1c1917; font-size: 16px;">Hi ${toName},</p>
              <p style="color: #44403c; line-height: 1.6;">Thank you for reaching out to PVStone. We've received your enquiry and our team will be in touch within 24 hours.</p>
              <p style="color: #44403c; line-height: 1.6;">In the meantime, feel free to visit our showroom or browse our <a href="https://pvstone.com.au/catalog" style="color: #bf9b30;">stone collection</a>.</p>
              <p style="color: #44403c; line-height: 1.6;">Warm regards,<br/><strong>The PVStone Team</strong></p>
            </div>
          </div>
        `,
      });
    } catch {
      this.logger.warn('Failed to send auto-reply email');
    }
  }
}
