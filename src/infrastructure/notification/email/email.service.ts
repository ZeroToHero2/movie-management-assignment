import * as sgMail from '@sendgrid/mail';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(private readonly configService: ConfigService) {
    sgMail.setApiKey(this.configService.get('EMAIL.SENDGRID_API_KEY'));
  }

  async sendMail(to: string[], subject: string, html: string): Promise<[sgMail.ClientResponse, object]> {
    const msg = {
      to,
      from: this.configService.get('EMAIL.SENDGRID_SINGLE_SENDER_EMAIL'), //? This is personal email address that is already verified in SendGrid :)
      subject,
      html,
    };

    return await sgMail.sendMultiple(msg);
  }
}
