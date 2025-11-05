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
      verificationTokenExpires
    });
    console.log('✅ [SIGNUP] User created with ID:', user.id);

    // Generate tokens
    console.log('🔑 [SIGNUP] Generating JWT tokens...');
    const tokens = generateTokens(user.id);
    console.log('✅ [SIGNUP] JWT tokens generated');

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

    // Invalidate all existing refresh tokens for this user (token rotation)
    await db.deleteUserRefreshTokens(user.id);

    // Generate new tokens
    const tokens = generateTokens(user.id);

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
    const tokens = generateTokens(user.id);

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
