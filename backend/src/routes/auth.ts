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
  sanitizeUser
} from '../utils/auth';

const router = Router();

// Cookie options
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  path: '/'
} as const;

// POST /api/auth/signup - User registration
router.post('/signup', signupLimiter, csrfProtection, signupValidation, handleValidationErrors, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, fullName } = req.body;

    // Check if user already exists
    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      throw new AppError(409, 'User with this email already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Generate verification token
    const verificationToken = generateRandomToken();

    // Create user
    const user = await db.createUser({
      email,
      passwordHash,
      fullName,
      emailVerified: false,
      verificationToken
    });

    // Generate tokens
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

    // TODO: Send verification email

    console.info(`User registered successfully - ID: ${user.id}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email to verify your account.',
      data: {
        user: sanitizeUser(user)
      }
    });
  } catch (error) {
    console.error('Signup failed');
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

    console.info(`User logged in successfully - ID: ${user.id}`);

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
    const users = await db.getAllSessions?.(); // This is a workaround - in production, add a getUserByVerificationToken method
    // TODO: Implement proper getUserByVerificationToken in database

    throw new AppError(501, 'Email verification not yet implemented');
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

    // TODO: Send password reset email

    console.info(`Password reset requested - User: ${user.id}, Email: ${email}`);

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

    // TODO: Implement getUserByResetToken in database
    throw new AppError(501, 'Password reset not yet implemented');
  } catch (error) {
    console.error('Password reset failed:', error);
    next(error);
  }
});

export const authRouter = router;