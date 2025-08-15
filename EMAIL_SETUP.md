# 📧 Production Email Setup Guide

## Overview
This guide explains how to set up real email verification for PCA-HIJAB in production using Resend.

## 1. Create Resend Account

1. Go to [Resend.com](https://resend.com)
2. Sign up for a free account (100 emails/day free)
3. Verify your email address

## 2. Get Your API Key

1. Log into Resend Dashboard
2. Go to **API Keys** section
3. Click **Create API Key**
4. Name it: `PCA-HIJAB Production`
5. Copy the API key (starts with `re_`)

## 3. Configure Environment Variables on Render

Add these environment variables to your Render backend service:

```bash
# Required for email service
EMAIL_ENABLED=true
RESEND_API_KEY=re_xxxxxxxxxxxxx  # Your Resend API key
CLIENT_URL=https://pca-hijab.vercel.app

# Optional: Custom domain email (if you have verified domain)
EMAIL_FROM=noreply@your-domain.com
EMAIL_FROM_NAME=PCA-HIJAB
```

### How to add on Render:
1. Go to your Render Dashboard
2. Select your backend service
3. Go to **Environment** tab
4. Click **Add Environment Variable**
5. Add each variable above
6. Click **Save Changes**
7. Service will auto-redeploy

## 4. Domain Verification (Optional but Recommended)

For professional emails from your own domain:

1. In Resend Dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `pca-hijab.com`)
4. Add the DNS records shown to your domain provider
5. Wait for verification (usually < 1 hour)
6. Update `EMAIL_FROM` to use your domain

## 5. Test Email Flow

### Test Signup Flow:
1. Go to https://pca-hijab.vercel.app/signup
2. Create a new account
3. Check email for verification link
4. Click link to verify
5. Login with verified account

### Test Password Reset:
1. Go to https://pca-hijab.vercel.app/forgot-password
2. Enter registered email
3. Check email for reset link
4. Click link and set new password

## 6. Monitor Email Delivery

In Resend Dashboard, you can:
- View sent emails
- Check delivery status
- See bounce/complaint rates
- Debug failed deliveries

## 7. Troubleshooting

### Emails not sending:
- Check `RESEND_API_KEY` is correct
- Verify `EMAIL_ENABLED=true`
- Check Render logs for errors

### Emails going to spam:
- Verify your domain with Resend
- Add SPF/DKIM records
- Use professional email content

### Links not working:
- Verify `CLIENT_URL` is correct
- Check token expiration times

## 8. Production Checklist

- [ ] Resend account created
- [ ] API key generated
- [ ] Environment variables configured on Render
- [ ] Test signup with real email
- [ ] Test password reset
- [ ] Domain verified (optional)
- [ ] SPF/DKIM records added (optional)

## 9. Free Tier Limits

Resend Free Tier:
- 100 emails/day
- 3,000 emails/month
- No credit card required

For higher volume, upgrade to paid plan.

## 10. Alternative Email Services

If Resend doesn't work for you:

### SendGrid
```bash
npm install @sendgrid/mail
SENDGRID_API_KEY=SG.xxxxx
```

### Gmail SMTP (Not recommended for production)
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=app-specific-password
```

### AWS SES
```bash
npm install @aws-sdk/client-ses
AWS_ACCESS_KEY_ID=xxxxx
AWS_SECRET_ACCESS_KEY=xxxxx
AWS_REGION=us-east-1
```

## Support

For issues with email setup:
1. Check Render logs: `Backend → Logs`
2. Check Resend dashboard for delivery status
3. Contact support@resend.com for Resend issues

---

**Note**: Never commit API keys to GitHub. Always use environment variables.