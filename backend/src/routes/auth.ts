import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { AppError } from '../middleware/errorHandler';
import { authenticateUser } from '../middleware/auth';
import {
  loginLimiter,
  signupLimiter,
  passwordResetLimiter
} from '../middleware/rateLimiter';
import { csrfProtection } from '../middleware/csrf';
import {
  signupValidation,
  loginValidation,
  accountLookupValidation,
  passwordResetValidation,
  resetPasswordValidation,
  emailVerificationValidation,
  handleValidationErrors
} from '../middleware/validation';
import {
  hashPassword,
  comparePassword,
  generateTokens,
  verifyRefreshToken,
  generateRandomToken,
  getRefreshTokenExpiryDate,
  getPasswordResetExpiryDate,
  getVerificationTokenExpiryDate,
  sanitizeUser
} from '../utils/auth';
import { maskUserId } from '../utils/logging';
import { emailService } from '../services/emailService';
import { ensureSeedAdmin } from '../services/adminBootstrap';
import { logAdminAction } from '../services/adminAuditService';
import { ADMIN_ROLES } from '../config/roles';

const router = Router();

// Cookie options
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/'
} as const;

// POST /api/auth/signup - User registration
router.post('/signup', signupLimiter, csrfProtection, signupValidation, handleValidationErrors, async (req: Request, res: Response, next: NextFunction) => {
  console.log('🚀 [SIGNUP] Request received:', {
    body: req.body,
    headers: {
      'content-type': req.headers['content-type'],
      'x-csrf-token': req.headers['x-csrf-token'],
      origin: req.headers.origin
    }
  });
  
  try {
    const { email, password, fullName } = req.body;
    console.log('📧 [SIGNUP] Processing signup for email:', email);

    // Check if user already exists
    console.log('🔍 [SIGNUP] Checking if user exists...');
    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      console.log('❌ [SIGNUP] User already exists:', email);
      throw new AppError(409, 'User with this email already exists');
    }
    console.log('✅ [SIGNUP] User does not exist, proceeding...');

    // Hash password
    console.log('🔐 [SIGNUP] Hashing password...');
    const passwordHash = await hashPassword(password);
    console.log('✅ [SIGNUP] Password hashed');

    // Generate verification token with expiry
    console.log('🎫 [SIGNUP] Generating verification token...');
    const verificationToken = generateRandomToken();
    const verificationTokenExpires = getVerificationTokenExpiryDate();
    console.log('✅ [SIGNUP] Token generated');

    // Create user
    console.log('👤 [SIGNUP] Creating user in database...');
    const user = await db.createUser({
      email,
      passwordHash,
      fullName,
      emailVerified: false,
      verificationToken,
      verificationTokenExpires,
      role: 'user'
    });
    console.log('✅ [SIGNUP] User created with ID:', user.id);

    // SECURITY: 이메일 인증 전에는 액세스/리프레시 토큰을 발급하지 않습니다.
    // 사용자는 이메일 인증 후 로그인 절차를 통해 토큰을 받게 됩니다.

    // Send verification email
    console.log('📨 [SIGNUP] Attempting to send verification email...');
    try {
      await emailService.sendVerificationEmail({
        userEmail: user.email,
        userName: user.fullName,
        verificationToken
      });
      console.log(`✅ [SIGNUP] Verification email sent to: ${user.email}`);
      console.info(`Verification email sent to user: ${maskUserId(user.id)}`);
    } catch (emailError) {
      console.error('❌ [SIGNUP] Email send failed:', {
        error: emailError instanceof Error ? emailError.message : emailError,
        user: user.email
      });
      console.error(`Failed to send verification email to user: ${maskUserId(user.id)}`, emailError);
      // Don't fail registration if email fails - user can request resend
    }

    console.log('🎉 [SIGNUP] Registration successful, sending response...');
    console.info(`User registered successfully - ID: ${maskUserId(user.id)}`);

    const response = {
      success: true,
      message: 'User registered successfully. Please check your email to verify your account.',
      data: {
        user: sanitizeUser(user)
      }
    };
    
    console.log('📤 [SIGNUP] Sending response:', response);
    res.status(201).json(response);
    console.log('✅ [SIGNUP] Response sent successfully');
    
  } catch (error) {
    console.error('❌ [SIGNUP] Signup failed:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      body: req.body
    });
    next(error);
  }
});

// POST /api/auth/login - User login
router.post('/login', loginLimiter, csrfProtection, loginValidation, handleValidationErrors, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await db.getUserByEmail(email);
    if (!user) {
      throw new AppError(401, 'Invalid credentials');
    }

    // Check password
    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      throw new AppError(401, 'Invalid credentials');
    }

    // Enforce email verification for non-admin users
    if (!ADMIN_ROLES.includes(user.role) && !user.emailVerified) {
      throw new AppError(403, 'Email not verified. Please check your inbox to verify your account.');
    }

    await db.updateUser(user.id, { lastLoginAt: new Date() });

    // Invalidate all existing refresh tokens for this user (token rotation)
    await db.deleteUserRefreshTokens(user.id);

    // Generate new tokens
    const tokens = generateTokens(user.id, user.role);

    // Create refresh token in database
    await db.createRefreshToken({
      userId: user.id,
      token: tokens.refreshToken,
      expiresAt: getRefreshTokenExpiryDate()
    });

    // Set cookies
    res.cookie('accessToken', tokens.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000 // 15 minutes
    });
    
    res.cookie('refreshToken', tokens.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    console.info(`User logged in successfully - ID: ${maskUserId(user.id)}`);

    if (ADMIN_ROLES.includes(user.role)) {
      void logAdminAction(
        'admin_login',
        {
          ip: req.ip,
          userAgent: req.get('user-agent') || 'unknown'
        },
        {
          userId: user.id,
          email: user.email,
          role: user.role
        }
      );
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: sanitizeUser(user)
      }
    });
  } catch (error) {
    console.error('Login failed');
    next(error);
  }
});

// POST /api/auth/refresh - Refresh access token
router.post('/refresh', async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new AppError(401, 'No refresh token provided');
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Check if refresh token exists in database
    const dbToken = await db.getRefreshToken(refreshToken);
    if (!dbToken || dbToken.userId !== decoded.userId) {
      throw new AppError(401, 'Invalid refresh token');
    }

    // Get user
    const user = await db.getUserById(decoded.userId);
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    // Generate new tokens
    const tokens = generateTokens(user.id, user.role);

    // Delete old refresh token
    await db.deleteRefreshToken(refreshToken);

    // Create new refresh token
    await db.createRefreshToken({
      userId: user.id,
      token: tokens.refreshToken,
      expiresAt: getRefreshTokenExpiryDate()
    });

    // Set new cookies
    res.cookie('accessToken', tokens.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000 // 15 minutes
    });
    
    res.cookie('refreshToken', tokens.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    console.error('Token refresh failed');
    next(error);
  }
});

// POST /api/auth/logout - User logout
router.post('/logout', csrfProtection, authenticateUser, async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      // Delete specific refresh token
      await db.deleteRefreshToken(refreshToken);
    }
    
    // Delete all user's refresh tokens
    await db.deleteUserRefreshTokens(req.user!.userId);

    // Clear cookies
    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);

    if (req.user && ADMIN_ROLES.includes(req.user.role)) {
      const adminUser = await db.getUserById(req.user.userId);
      if (adminUser) {
        void logAdminAction(
          'admin_logout',
          {
            ip: req.ip,
            userAgent: req.get('user-agent') || 'unknown'
          },
          {
            userId: adminUser.id,
            email: adminUser.email,
            role: adminUser.role
          }
        );
      }
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout failed');
    next(error);
  }
});

// GET /api/auth/me - Get current user
router.get('/me', authenticateUser, async (req, res, next) => {
  try {
    const user = await db.getUserById(req.user!.userId);

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    res.json({
      success: true,
      data: {
        user: sanitizeUser(user)
      }
    });
  } catch (error) {
    console.error('Get user failed:', error);
    next(error);
  }
});

// POST /api/auth/verify-email - Verify email address
router.post('/verify-email', emailVerificationValidation, handleValidationErrors, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;

    // Find user by verification token
    const user = await db.getUserByVerificationToken(token);
    
    if (!user) {
      throw new AppError(400, 'Invalid or expired verification token');
    }

    // Verify the user's email
    const success = await db.verifyUserEmail(user.id);
    
    if (!success) {
      throw new AppError(500, 'Failed to verify email');
    }

    console.info(`Email verified successfully - User: ${maskUserId(user.id)}`);

    res.json({
      success: true,
      message: 'Email verified successfully. You can now log in.'
    });
  } catch (error) {
    console.error('Email verification failed:', error);
    next(error);
  }
});

// POST /api/auth/admin-login - Admin login via environment credentials
router.post('/admin-login', loginLimiter, csrfProtection, loginValidation, handleValidationErrors, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const seedEmail = process.env.ADMIN_SEED_EMAIL;
    const seedPassword = process.env.ADMIN_SEED_PASSWORD;

    if (!seedEmail || !seedPassword) {
      throw new AppError(503, 'Admin login not configured');
    }

    const normalizeForCompare = (e: string): string => {
      const lower = e.trim().toLowerCase();
      const atIdx = lower.lastIndexOf('@');
      if (atIdx < 0) return lower;
      const local = lower.slice(0, atIdx);
      const domain = lower.slice(atIdx + 1);
      if (domain === 'gmail.com' || domain === 'googlemail.com') {
        return `${local.replace(/\./g, '')}@${domain}`;
      }
      return lower;
    };

    const matchesEmail = normalizeForCompare(email) === normalizeForCompare(seedEmail);
    const matchesPassword = password === seedPassword;

    if (!matchesEmail || !matchesPassword) {
      throw new AppError(401, 'Invalid admin credentials');
    }

    // Ensure seed admin exists and is synchronized
    await ensureSeedAdmin();

    // Fetch admin user from DB
    const adminUser = await db.getUserByEmail(seedEmail);
    if (!adminUser || !ADMIN_ROLES.includes(adminUser.role)) {
      throw new AppError(500, 'Admin account not available');
    }

    // Token rotation: invalidate existing refresh tokens
    await db.deleteUserRefreshTokens(adminUser.id);

    // Generate new tokens
    const tokens = generateTokens(adminUser.id, adminUser.role);

    // Create refresh token record
    await db.createRefreshToken({
      userId: adminUser.id,
      token: tokens.refreshToken,
      expiresAt: getRefreshTokenExpiryDate()
    });

    // Set cookies
    res.cookie('accessToken', tokens.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000
    });
    res.cookie('refreshToken', tokens.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Audit
    void logAdminAction(
      'admin_login',
      { ip: req.ip, userAgent: req.get('user-agent') || 'unknown' },
      { userId: adminUser.id, email: adminUser.email, role: adminUser.role }
    );

    res.json({
      success: true,
      message: 'Admin login successful',
      data: { user: sanitizeUser(adminUser) }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/forgot-password - Request password reset
router.post('/forgot-password', passwordResetLimiter, passwordResetValidation, handleValidationErrors, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    const user = await db.getUserByEmail(email);
    if (!user) {
      // Don't reveal if user exists
      res.json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link'
      });
      return;
    }

    // Generate reset token
    const resetToken = generateRandomToken();

    // Update user with reset token
    await db.updateUser(user.id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: getPasswordResetExpiryDate()
    });

    // Send password reset email
    try {
      await emailService.sendPasswordResetEmail({
        userEmail: user.email,
        userName: user.fullName,
        resetToken
      });
      console.info(`Password reset email sent to user: ${maskUserId(user.id)}`);
    } catch (emailError) {
      console.error(`Failed to send password reset email to user: ${maskUserId(user.id)}`, emailError);
      // Don't fail the request if email fails - user can retry
    }

    console.info(`Password reset requested - User: ${maskUserId(user.id)}`);

    res.json({
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link'
    });
  } catch (error) {
    console.error('Password reset request failed:', error);
    next(error);
  }
});

// POST /api/auth/find-account - Send account reminder email
router.post('/find-account', passwordResetLimiter, accountLookupValidation, handleValidationErrors, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    const user = await db.getUserByEmail(email);

    if (user) {
      try {
        await emailService.sendAccountReminderEmail({
          userEmail: user.email,
          userName: user.fullName
        });
        console.info(`Account reminder email sent to user: ${maskUserId(user.id)}`);
      } catch (emailError) {
        console.error(`Failed to send account reminder email to user: ${maskUserId(user.id)}`, emailError);
      }
    }

    res.json({
      success: true,
      message: 'If an account exists with this email, we just sent you a reminder.'
    });
  } catch (error) {
    console.error('Account reminder request failed:', error);
    next(error);
  }
});

// POST /api/auth/reset-password - Reset password
router.post('/reset-password', resetPasswordValidation, handleValidationErrors, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, newPassword } = req.body;

    // Find user by reset token
    const user = await db.getUserByResetToken(token);
    
    if (!user) {
      throw new AppError(400, 'Invalid or expired reset token');
    }

    // Hash the new password
    const newPasswordHash = await hashPassword(newPassword);

    // Reset the password
    const success = await db.resetUserPassword(user.id, newPasswordHash);
    
    if (!success) {
      throw new AppError(500, 'Failed to reset password');
    }

    // Invalidate all existing refresh tokens for security
    await db.deleteUserRefreshTokens(user.id);

    console.info(`Password reset successfully - User: ${maskUserId(user.id)}`);

    res.json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.'
    });
  } catch (error) {
    console.error('Password reset failed:', error);
    next(error);
  }
});

export const authRouter = router;
