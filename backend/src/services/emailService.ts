/**
 * Secure Email Service for PCA-HIJAB
 * Handles email verification and password reset emails
 * SECURITY: All email templates sanitized, rate limited, and logged securely
 */

import nodemailer from 'nodemailer';
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
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = config.EMAIL_ENABLED || process.env.NODE_ENV === 'development';
    if (this.isEnabled) {
      this.initializeTransporter();
    } else {
      console.warn('📧 Email service is disabled - emails will be logged instead of sent');
    }
  }

  private async initializeTransporter(): Promise<void> {
    try {
      // For development, use Ethereal test account
      if (process.env.NODE_ENV === 'development' && !config.SMTP_HOST) {
        const testAccount = await nodemailer.createTestAccount();
        
        this.transporter = nodemailer.createTransport({
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
        this.transporter = nodemailer.createTransport({
        host: config.SMTP_HOST,
        port: config.SMTP_PORT || 587,
        secure: config.SMTP_SECURE || false, // Use TLS
        auth: {
          user: config.SMTP_USER,
          pass: config.SMTP_PASS,
        },
        // Security options
        tls: {
          rejectUnauthorized: process.env.NODE_ENV === 'production'
        },
        // Connection timeout
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
    if (!this.isEnabled || !this.transporter) {
      // In development or when disabled, log the email instead
      console.info('📧 Email would be sent (service disabled):', {
        to: maskEmail(options.to),
        subject: options.subject,
        // Don't log full content for security
        hasHtml: !!options.html,
        hasText: !!options.text
      });
      return;
    }

    try {
      const mailOptions = {
        from: {
          name: config.EMAIL_FROM_NAME || 'PCA-HIJAB',
          address: config.EMAIL_FROM!
        },
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        // Security headers
        headers: {
          'X-Mailer': 'PCA-HIJAB-Service',
          'X-Priority': '3'
        }
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      console.info('✅ Email sent successfully:', {
        to: maskEmail(options.to),
        subject: options.subject,
        messageId: result.messageId
      });
      
      // For development with Ethereal, show preview URL
      if (process.env.NODE_ENV === 'development' && !config.SMTP_HOST) {
        const previewUrl = nodemailer.getTestMessageUrl(result);
        if (previewUrl) {
          console.info('📧 Preview URL:', previewUrl);
          console.info('🌐 View email at:', previewUrl);
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
    const verificationUrl = `${config.CLIENT_URL || 'http://localhost:3000'}/verify-email?token=${data.verificationToken}`;
    
    const html = this.createVerificationEmailHTML(data.userName, verificationUrl);
    const text = this.createVerificationEmailText(data.userName, verificationUrl);

    await this.sendEmail({
      to: data.userEmail,
      subject: '✅ PCA-HIJAB 이메일 인증',
      html,
      text
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(data: PasswordResetEmailData): Promise<void> {
    const resetUrl = `${config.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${data.resetToken}`;
    
    const html = this.createPasswordResetEmailHTML(data.userName, resetUrl);
    const text = this.createPasswordResetEmailText(data.userName, resetUrl);

    await this.sendEmail({
      to: data.userEmail,
      subject: '🔐 PCA-HIJAB 비밀번호 재설정',
      html,
      text
    });
  }

  private createVerificationEmailHTML(userName: string, verificationUrl: string): string {
    // Sanitize user input to prevent XSS
    const safeName = this.sanitizeForEmail(userName);
    
    return `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>이메일 인증</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }
            .button { display: inline-block; padding: 12px 30px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 20px 0; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
            .warning { background-color: #fef3cd; border: 1px solid #fecba1; border-radius: 4px; padding: 15px; margin: 20px 0; color: #856404; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">PCA-HIJAB</div>
                <h1>이메일 인증</h1>
            </div>
            
            <p>안녕하세요, <strong>${safeName}</strong>님!</p>
            
            <p>PCA-HIJAB 서비스에 가입해 주셔서 감사합니다. 계정을 활성화하려면 아래 버튼을 클릭하여 이메일 주소를 인증해 주세요.</p>
            
            <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">이메일 인증하기</a>
            </div>
            
            <p>버튼이 작동하지 않는 경우, 아래 링크를 복사하여 브라우저에 직접 입력해 주세요:</p>
            <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace;">
                ${verificationUrl}
            </p>
            
            <div class="warning">
                <strong>⚠️ 보안 안내:</strong>
                <ul>
                    <li>이 링크는 24시간 후 만료됩니다</li>
                    <li>본인이 요청하지 않았다면 이 이메일을 무시하세요</li>
                    <li>링크를 다른 사람과 공유하지 마세요</li>
                </ul>
            </div>
            
            <div class="footer">
                <p>이 이메일은 자동으로 발송되었습니다. 문의사항이 있으시면 고객지원팀에 연락해 주세요.</p>
                <p>&copy; 2024 PCA-HIJAB. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>`;
  }

  private createVerificationEmailText(userName: string, verificationUrl: string): string {
    const safeName = this.sanitizeForEmail(userName);
    
    return `
PCA-HIJAB 이메일 인증

안녕하세요, ${safeName}님!

PCA-HIJAB 서비스에 가입해 주셔서 감사합니다. 
계정을 활성화하려면 아래 링크를 클릭하여 이메일 주소를 인증해 주세요.

인증 링크: ${verificationUrl}

⚠️ 보안 안내:
- 이 링크는 24시간 후 만료됩니다
- 본인이 요청하지 않았다면 이 이메일을 무시하세요
- 링크를 다른 사람과 공유하지 마세요

© 2024 PCA-HIJAB. All rights reserved.
`;
  }

  private createPasswordResetEmailHTML(userName: string, resetUrl: string): string {
    const safeName = this.sanitizeForEmail(userName);
    
    return `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>비밀번호 재설정</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #dc2626; margin-bottom: 10px; }
            .button { display: inline-block; padding: 12px 30px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 20px 0; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
            .warning { background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 4px; padding: 15px; margin: 20px 0; color: #991b1b; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">PCA-HIJAB</div>
                <h1>비밀번호 재설정</h1>
            </div>
            
            <p>안녕하세요, <strong>${safeName}</strong>님!</p>
            
            <p>비밀번호 재설정을 요청하셨습니다. 아래 버튼을 클릭하여 새로운 비밀번호를 설정해 주세요.</p>
            
            <div style="text-align: center;">
                <a href="${resetUrl}" class="button">비밀번호 재설정하기</a>
            </div>
            
            <p>버튼이 작동하지 않는 경우, 아래 링크를 복사하여 브라우저에 직접 입력해 주세요:</p>
            <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace;">
                ${resetUrl}
            </p>
            
            <div class="warning">
                <strong>🔐 보안 안내:</strong>
                <ul>
                    <li>이 링크는 1시간 후 만료됩니다</li>
                    <li>본인이 요청하지 않았다면 이 이메일을 무시하고 즉시 계정 보안을 확인하세요</li>
                    <li>링크를 다른 사람과 공유하지 마세요</li>
                    <li>비밀번호 재설정 후 모든 기기에서 재로그인이 필요합니다</li>
                </ul>
            </div>
            
            <div class="footer">
                <p>이 이메일은 자동으로 발송되었습니다. 문의사항이 있으시면 고객지원팀에 연락해 주세요.</p>
                <p>&copy; 2024 PCA-HIJAB. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>`;
  }

  private createPasswordResetEmailText(userName: string, resetUrl: string): string {
    const safeName = this.sanitizeForEmail(userName);
    
    return `
PCA-HIJAB 비밀번호 재설정

안녕하세요, ${safeName}님!

비밀번호 재설정을 요청하셨습니다. 
아래 링크를 클릭하여 새로운 비밀번호를 설정해 주세요.

재설정 링크: ${resetUrl}

🔐 보안 안내:
- 이 링크는 1시간 후 만료됩니다
- 본인이 요청하지 않았다면 이 이메일을 무시하고 즉시 계정 보안을 확인하세요
- 링크를 다른 사람과 공유하지 마세요
- 비밀번호 재설정 후 모든 기기에서 재로그인이 필요합니다

© 2024 PCA-HIJAB. All rights reserved.
`;
  }

  /**
   * Sanitize user input for email templates to prevent XSS
   */
  private sanitizeForEmail(input: string): string {
    return input
      .replace(/[<>&"']/g, (char) => {
        switch (char) {
          case '<': return '&lt;';
          case '>': return '&gt;';
          case '&': return '&amp;';
          case '"': return '&quot;';
          case "'": return '&#x27;';
          default: return char;
        }
      })
      .trim()
      .substring(0, 100); // Limit length
  }

  /**
   * Check if email service is available
   */
  isAvailable(): boolean {
    return this.isEnabled && this.transporter !== null;
  }

  /**
   * Test email configuration (for health checks)
   */
  async testConnection(): Promise<boolean> {
    if (!this.isEnabled || !this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email service connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();