# Security Policy

## 🔒 Security Overview

This document outlines the security measures and procedures for the PCA-HIJAB project. Our security-first approach ensures the protection of user data and system integrity.

## 🛡️ Automated Security Measures

### CI/CD Security Pipeline

Our GitHub Actions workflows automatically perform security checks on every commit:

- **Security Audit Workflow** (`security-audit.yml`)
  - Runs daily at 02:00 UTC
  - Checks for vulnerabilities in all dependencies
  - Fails builds for critical/high severity issues
  - Generates detailed security reports

- **CI Pipeline** (`ci.yml`)
  - Quick security check on every PR
  - Linting and type checking
  - Build verification

### Dependency Management

- **Dependabot** automatically creates PRs for security updates
- Grouped updates for easier review
- Weekly schedule for dependency updates
- Automatic security patches

## 🔍 Manual Security Checks

### Backend Security Commands

```bash
cd backend

# Run comprehensive security audit
npm run security:check

# Check for critical vulnerabilities only
npm run audit:critical

# Check for high and critical vulnerabilities
npm run audit:high

# Generate detailed audit report
npm run security:report

# Fix automatically fixable vulnerabilities
npm run audit:fix
```

### Frontend Security Commands

```bash
cd frontend

# Run comprehensive security check (includes tests)
npm run security:check

# Check for critical vulnerabilities only
npm run audit:critical

# Check for high and critical vulnerabilities
npm run audit:high

# Generate detailed audit report
npm run security:report

# Fix automatically fixable vulnerabilities
npm run audit:fix
```

## 🚨 Security Features Implemented

### Authentication & Authorization
- ✅ JWT tokens stored in HttpOnly cookies
- ✅ CSRF protection with token validation
- ✅ Token rotation on login
- ✅ Refresh token security
- ✅ Resource ownership verification
- ✅ API key authentication for admin endpoints

### Password Security
- ✅ bcrypt hashing with salt rounds (10)
- ✅ Password complexity requirements
- ✅ Rate limiting on auth endpoints
- ✅ Secure password reset with expiring tokens

### Data Protection
- ✅ Input sanitization (XSS prevention)
- ✅ SQL injection prevention with parameterized queries
- ✅ Secure logging (sensitive data masking)
- ✅ Email verification with expiring tokens
- ✅ HTTPS enforcement in production

### Infrastructure Security
- ✅ Helmet.js security headers
- ✅ CORS configuration with strict origins
- ✅ Rate limiting for DDoS protection
- ✅ Environment variable validation
- ✅ Automated token cleanup scheduler

### Email Security
- ✅ Secure SMTP configuration
- ✅ HTML template sanitization
- ✅ Email address masking in logs

## ⚡ Quick Security Checklist

### Before Deployment
- [ ] Run `npm run security:check` in both backend and frontend
- [ ] Verify no critical/high vulnerabilities exist
- [ ] Ensure all environment variables are properly configured
- [ ] Test email functionality in staging environment
- [ ] Verify HTTPS enforcement is working
- [ ] Check that CORS origins are properly configured

### Regular Maintenance
- [ ] Review and merge Dependabot PRs weekly
- [ ] Monitor daily security audit reports
- [ ] Update environment secrets if compromised
- [ ] Review access logs for suspicious activity
- [ ] Rotate JWT secrets periodically in production

## 🔧 Development Security Guidelines

### Environment Variables
Never commit sensitive data to version control:

```bash
# ❌ NEVER DO THIS
JWT_SECRET=mysecret123

# ✅ USE STRONG RANDOM VALUES
JWT_SECRET=$(openssl rand -base64 32)
ADMIN_API_KEY=$(openssl rand -base64 24)
```

### Secure Coding Practices
1. **Always validate user input** - Use express-validator
2. **Use parameterized queries** - Prevent SQL injection
3. **Sanitize output** - Prevent XSS attacks
4. **Mask sensitive data in logs** - Use secure logging utilities
5. **Implement proper error handling** - Don't expose stack traces
6. **Use HTTPS in production** - Enforce secure connections

### Testing Security Features
```bash
# Test authentication
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"wrongpassword"}'

# Test rate limiting
for i in {1..20}; do
  curl -X POST http://localhost:5001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"test"}'
done

# Test CSRF protection
curl -X POST http://localhost:5001/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"instagramId":"test"}' \
  # Should fail without CSRF token
```

## 📊 Security Monitoring

### Automated Monitoring
- GitHub Security Advisories
- Dependabot alerts
- Daily vulnerability scans
- CI/CD security pipeline failures

### Manual Monitoring
- Review server logs for suspicious activity
- Monitor failed authentication attempts
- Check for unusual API usage patterns
- Review email delivery logs

## 🚨 Incident Response

### If a Vulnerability is Discovered

1. **Immediate Response**
   - Assess the severity and impact
   - If critical, consider taking the service offline
   - Document the vulnerability

2. **Fix Development**
   - Create a private fix branch
   - Test the fix thoroughly
   - Run security audits

3. **Deployment**
   - Deploy the fix immediately
   - Update all affected environments
   - Monitor for any issues

4. **Post-Incident**
   - Update security documentation
   - Review and improve security measures
   - Consider security training if needed

### Contact Information

For security issues, please contact:
- **Email**: security@pca-hijab.com (if available)
- **GitHub**: Create a private security advisory
- **Urgent Issues**: Contact repository administrators directly

## 📚 Security Resources

### Tools Used
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit) - Vulnerability scanning
- [ESLint Security Plugin](https://github.com/eslint-community/eslint-plugin-security) - Static analysis
- [Helmet.js](https://helmetjs.github.io/) - Security headers
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js) - Password hashing

### External Resources
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

**Last Updated**: December 2024
**Next Review**: January 2025