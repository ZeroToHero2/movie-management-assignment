import * as QRCode from 'qrcode';
import { CONSTANTS } from '@application/common/constants';

export default async function generateBuyTicketEmailTemplate(
  ticketId: string,
  movieName: string,
  date: string,
  time: string,
  serverBaseUrl: string,
): Promise<{ mailSubject: string; htmlContent: string }> {
  const {
    EMAIL: {
      QR: { TYPE, WIDTH, MARGIN, RENDER_OPTS, ERROR_CORRECTION_LEVEL, COLOR },
    },
  } = CONSTANTS;

  const mailSubject = `Ticket Confirmation - ${movieName}`;
  const qrCodeData = await QRCode.toDataURL(`${serverBaseUrl}/tickets/${ticketId}/watch`, {
    type: TYPE,
    width: WIDTH,
    margin: MARGIN,
    renderOpts: RENDER_OPTS,
    errorCorrectionLevel: ERROR_CORRECTION_LEVEL,
    color: {
      dark: COLOR.DARK,
      light: COLOR.LIGHT,
    },
  });

  const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Movie Ticket Confirmation</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f4f4f4;
                }
                .container {
                    width: 100%;
                    max-width: 600px;
                    margin: 20px auto;
                    background-color: #ffffff;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    border-radius: 8px;
                    overflow: hidden;
                }
                .header {
                    background-color: #1a237e;
                    color: #ffffff;
                    padding: 20px;
                    text-align: center;
                }
                .content {
                    padding: 30px;
                    text-align: center;
                }
                .ticket-info {
                    background-color: #f8f9fa;
                    border-radius: 8px;
                    padding: 20px;
                    margin: 20px 0;
                }
                .ticket-detail {
                    margin: 10px 0;
                    font-size: 16px;
                }
                .movie-name {
                    font-size: 24px;
                    color: #1a237e;
                    font-weight: bold;
                    margin-bottom: 20px;
                }
                .footer {
                    background-color: #f2f2f2;
                    color: #777777;
                    padding: 20px;
                    text-align: center;
                    font-size: 14px;
                }
                .qr-placeholder {
                    width: 200px;
                    height: 200px;
                    background-color: #f2f2f2;
                    margin: 0 auto;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 8px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Movie Ticket Confirmation</h1>
                </div>
                <div class="content">
                    <p>Thank you for your purchase! Here are your ticket details:</p>
                    
                    <div class="ticket-info">
                        <div class="movie-name">${movieName}</div>
                        <div class="ticket-detail"><strong>Date:</strong> ${date}</div>
                        <div class="ticket-detail"><strong>Time:</strong> ${time}</div>
                    </div>

                    <div class="qr-placeholder">
                        <img src="${qrCodeData}" 
                             alt="Ticket QR Code" 
                             style="width: 200px; height: 200px; display: block; margin: 0 auto;"
                        />
                    </div>

                    <p>Please show this email or your QR code at the cinema entrance.</p>
                    <p>Enjoy your movie! 🎬</p>
                </div>
                <div class="footer">
                    <p>This is an automated confirmation email. Please do not reply.</p>
                    <p>For any questions, please contact our support team.</p>
                </div>
            </div>
        </body>
        </html>
      `;

  return { mailSubject, htmlContent };
}
