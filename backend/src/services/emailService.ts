/**
 * Production Email Service using Resend
 * Handles email verification and password reset emails
 */

import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { config } from '../config/environment';
import { maskEmail } from '../utils/logging';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

interface VerificationEmailData {
  userEmail: string;
  userName: string;
  verificationToken: string;
}

interface PasswordResetEmailData {
  userEmail: string;
  userName: string;
  resetToken: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private resend: Resend | null = null;
  private isEnabled: boolean;
  private useResend: boolean;

  constructor() {
    this.isEnabled = config.EMAIL_ENABLED || process.env.NODE_ENV === 'development';
    this.useResend = !!process.env.RESEND_API_KEY;
    
    if (this.isEnabled) {
      if (this.useResend) {
        this.initializeResend();
      } else {
        this.initializeTransporter();
      }
    } else {
      console.warn('📧 Email service is disabled - emails will be logged instead of sent');
    }
  }

  private initializeResend(): void {
    try {
      this.resend = new Resend(process.env.RESEND_API_KEY!);
      console.info('✅ Email service initialized with Resend');
    } catch (error) {
      console.error('❌ Failed to initialize Resend:', error);
      this.isEnabled = false;
    }
  }

  private async initializeTransporter(): Promise<void> {
    try {
      // For development, use Ethereal test account
      if (process.env.NODE_ENV === 'development' && !config.SMTP_HOST) {
        const testAccount = await nodemailer.createTestAccount();
        
        this.transporter = nodemailer.createTransporter({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        
        console.info('✅ Email transporter initialized with Ethereal test account');
        console.info('📧 Ethereal account:', {
          user: testAccount.user,
          pass: testAccount.pass,
          web: 'https://ethereal.email'
        });
      } else {
        // Production or custom SMTP settings
        this.transporter = nodemailer.createTransporter({
        host: config.SMTP_HOST,
        port: config.SMTP_PORT || 587,
        secure: config.SMTP_SECURE || false,
        auth: {
          user: config.SMTP_USER,
          pass: config.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: process.env.NODE_ENV === 'production'
        },
        connectionTimeout: 10000,
        greetingTimeout: 5000,
        socketTimeout: 10000,
        });
        
        console.info('✅ Email transporter initialized with custom SMTP settings');
      }
    } catch (error) {
      console.error('❌ Failed to initialize email transporter:', error);
      this.isEnabled = false;
    }
  }

  private async sendEmail(options: EmailOptions): Promise<void> {
    if (!this.isEnabled) {
      console.info('📧 Email would be sent (service disabled):', {
        to: maskEmail(options.to),
        subject: options.subject,
        hasHtml: !!options.html,
        hasText: !!options.text
      });
      return;
    }

    try {
      if (this.useResend && this.resend) {
        // Use Resend API
        const result = await this.resend.emails.send({
          from: config.EMAIL_FROM || 'PCA-HIJAB <onboarding@resend.dev>',
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text,
        });
        
        console.info('✅ Email sent via Resend:', {
          to: maskEmail(options.to),
          subject: options.subject,
          id: result.data?.id
        });
      } else if (this.transporter) {
        // Use SMTP
        const mailOptions = {
          from: {
            name: config.EMAIL_FROM_NAME || 'PCA-HIJAB',
            address: config.EMAIL_FROM || 'noreply@pca-hijab.com'
          },
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text,
          headers: {
            'X-Mailer': 'PCA-HIJAB-Service',
            'X-Priority': '3'
          }
        };

        const result = await this.transporter.sendMail(mailOptions);
        
        console.info('✅ Email sent via SMTP:', {
          to: maskEmail(options.to),
          subject: options.subject,
          messageId: result.messageId
        });
        
        // For development with Ethereal, show preview URL
        if (process.env.NODE_ENV === 'development' && !config.SMTP_HOST) {
          const previewUrl = nodemailer.getTestMessageUrl(result);
          if (previewUrl) {
            console.info('📧 Preview URL:', previewUrl);
          }
        }
      }
    } catch (error) {
      console.error('❌ Failed to send email:', {
        to: maskEmail(options.to),
        subject: options.subject,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error('Failed to send email');
    }
  }

  /**
   * Send email verification email
   */
  async sendVerificationEmail(data: VerificationEmailData): Promise<void> {
    const verificationUrl = `${config.CLIENT_URL || 'https://pca-hijab.vercel.app'}/verify-email?token=${data.verificationToken}`;
    
    const html = this.createVerificationEmailHTML(data.userName, verificationUrl);
    const text = this.createVerificationEmailText(data.userName, verificationUrl);

    await this.sendEmail({
      to: data.userEmail,
      subject: '✅ Verify your PCA-HIJAB account',
      html,
      text
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(data: PasswordResetEmailData): Promise<void> {
    const resetUrl = `${config.CLIENT_URL || 'https://pca-hijab.vercel.app'}/reset-password?token=${data.resetToken}`;
    
    const html = this.createPasswordResetEmailHTML(data.userName, resetUrl);
    const text = this.createPasswordResetEmailText(data.userName, resetUrl);

    await this.sendEmail({
      to: data.userEmail,
      subject: '🔐 Reset your PCA-HIJAB password',
      html,
      text
    });
  }

  private createVerificationEmailHTML(userName: string, verificationUrl: string): string {
    const safeName = this.sanitizeForEmail(userName);
    
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 28px; font-weight: bold; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 10px; }
            h1 { color: #1a1a1a; font-size: 24px; margin: 20px 0; }
            p { color: #4a4a4a; line-height: 1.6; margin: 15px 0; }
            .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 25px 0; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); transition: transform 0.2s; }
            .button:hover { transform: translateY(-2px); }
            .url-box { background-color: #f8f9fa; padding: 15px; border-radius: 8px; font-family: 'Courier New', monospace; word-break: break-all; margin: 20px 0; border: 1px solid #e9ecef; }
            .warning { background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 15px; margin: 25px 0; }
            .warning-title { color: #856404; font-weight: bold; margin-bottom: 10px; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; }
            .footer p { font-size: 13px; color: #999; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">PCA-HIJAB</div>
                <h1>Verify Your Email Address</h1>
            </div>
            
            <p>Hi ${safeName},</p>
            
            <p>Welcome to PCA-HIJAB! We're excited to have you on board. To get started with your AI-powered personal color analysis journey, please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <div class="url-box">${verificationUrl}</div>
            
            <div class="warning">
                <div class="warning-title">⚠️ Important Security Information</div>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>This link expires in 24 hours</li>
                    <li>If you didn't create an account, please ignore this email</li>
                    <li>Never share this link with anyone</li>
                </ul>
            </div>
            
            <p>Once verified, you'll be able to:</p>
            <ul style="color: #4a4a4a; line-height: 1.8;">
                <li>Get your AI-powered personal color analysis</li>
                <li>Receive personalized hijab color recommendations</li>
                <li>Save your color profile and results</li>
                <li>Access exclusive style tips and content</li>
            </ul>
            
            <div class="footer">
                <p>This is an automated message from PCA-HIJAB. Please do not reply to this email.</p>
                <p>Need help? Contact our support team at support@pca-hijab.com</p>
                <p>&copy; 2024 PCA-HIJAB. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>`;
  }

  private createVerificationEmailText(userName: string, verificationUrl: string): string {
    const safeName = this.sanitizeForEmail(userName);
    
    return `
PCA-HIJAB Email Verification

Hi ${safeName},

Welcome to PCA-HIJAB! We're excited to have you on board.

To get started with your AI-powered personal color analysis journey, please verify your email address by clicking the link below:

${verificationUrl}

This link expires in 24 hours.

Once verified, you'll be able to:
- Get your AI-powered personal color analysis
- Receive personalized hijab color recommendations
- Save your color profile and results
- Access exclusive style tips and content

Security Notice:
- If you didn't create an account, please ignore this email
- Never share this verification link with anyone

Need help? Contact our support team at support@pca-hijab.com

© 2024 PCA-HIJAB. All rights reserved.
`;
  }

  private createPasswordResetEmailHTML(userName: string, resetUrl: string): string {
    const safeName = this.sanitizeForEmail(userName);
    
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 28px; font-weight: bold; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 10px; }
            h1 { color: #1a1a1a; font-size: 24px; margin: 20px 0; }
            p { color: #4a4a4a; line-height: 1.6; margin: 15px 0; }
            .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 25px 0; box-shadow: 0 4px 15px rgba(231, 76, 60, 0.4); transition: transform 0.2s; }
            .button:hover { transform: translateY(-2px); }
            .url-box { background-color: #f8f9fa; padding: 15px; border-radius: 8px; font-family: 'Courier New', monospace; word-break: break-all; margin: 20px 0; border: 1px solid #e9ecef; }
            .warning { background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 15px; margin: 25px 0; }
            .warning-title { color: #856404; font-weight: bold; margin-bottom: 10px; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; }
            .footer p { font-size: 13px; color: #999; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">PCA-HIJAB</div>
                <h1>Reset Your Password</h1>
            </div>
            
            <p>Hi ${safeName},</p>
            
            <p>We received a request to reset your password for your PCA-HIJAB account. Click the button below to create a new password:</p>
            
            <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <div class="url-box">${resetUrl}</div>
            
            <div class="warning">
                <div class="warning-title">⚠️ Important Security Information</div>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>This link expires in 1 hour</li>
                    <li>If you didn't request a password reset, please ignore this email</li>
                    <li>Your password won't change until you create a new one</li>
                    <li>Never share this link with anyone</li>
                </ul>
            </div>
            
            <p><strong>Tips for creating a strong password:</strong></p>
            <ul style="color: #4a4a4a; line-height: 1.8;">
                <li>Use at least 8 characters</li>
                <li>Include uppercase and lowercase letters</li>
                <li>Add numbers and special characters</li>
                <li>Don't use personal information</li>
            </ul>
            
            <div class="footer">
                <p>This is an automated message from PCA-HIJAB. Please do not reply to this email.</p>
                <p>Need help? Contact our support team at support@pca-hijab.com</p>
                <p>&copy; 2024 PCA-HIJAB. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>`;
  }

  private createPasswordResetEmailText(userName: string, resetUrl: string): string {
    const safeName = this.sanitizeForEmail(userName);
    
    return `
PCA-HIJAB Password Reset

Hi ${safeName},

We received a request to reset your password for your PCA-HIJAB account.

Click the link below to create a new password:

${resetUrl}

This link expires in 1 hour.

Security Notice:
- If you didn't request a password reset, please ignore this email
- Your password won't change until you create a new one
- Never share this reset link with anyone

Tips for creating a strong password:
- Use at least 8 characters
- Include uppercase and lowercase letters
- Add numbers and special characters
- Don't use personal information

Need help? Contact our support team at support@pca-hijab.com

© 2024 PCA-HIJAB. All rights reserved.
`;
  }

  private sanitizeForEmail(input: string): string {
    // Remove any HTML tags and escape special characters
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}

export const emailService = new EmailService();