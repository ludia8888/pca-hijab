/**
 * Comprehensive environment variable validation and configuration
 * Security-first approach with mandatory validation
 */

interface EnvironmentConfig {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL?: string;
  CLIENT_URL?: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  ADMIN_API_KEY: string;
}

class EnvironmentValidator {
  private config: EnvironmentConfig;

  constructor() {
    this.config = this.validateAndLoad();
  }

  private validateAndLoad(): EnvironmentConfig {
    const nodeEnv = process.env.NODE_ENV || 'development';
    const isProduction = nodeEnv === 'production';

    // Production security validations
    if (isProduction) {
      this.validateProductionRequirements();
    }

    return {
      NODE_ENV: nodeEnv,
      PORT: parseInt(process.env.PORT || '5001', 10),
      DATABASE_URL: process.env.DATABASE_URL,
      CLIENT_URL: process.env.CLIENT_URL,
      JWT_SECRET: this.validateJWTSecret(process.env.JWT_SECRET, 'JWT_SECRET'),
      JWT_REFRESH_SECRET: this.validateJWTSecret(process.env.JWT_REFRESH_SECRET, 'JWT_REFRESH_SECRET'),
      ADMIN_API_KEY: this.validateAdminApiKey(process.env.ADMIN_API_KEY)
    };
  }

  private validateProductionRequirements(): void {
    const requiredVars = [
      'DATABASE_URL',
      'JWT_SECRET', 
      'JWT_REFRESH_SECRET',
      'ADMIN_API_KEY'
    ];

    const missing = requiredVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
      throw new Error(`FATAL: Missing required environment variables in production: ${missing.join(', ')}`);
    }

    // Validate DATABASE_URL in production
    if (!process.env.DATABASE_URL?.startsWith('postgres://') && !process.env.DATABASE_URL?.startsWith('postgresql://')) {
      throw new Error('FATAL: DATABASE_URL must be a valid PostgreSQL connection string in production');
    }

    console.info('✅ All required environment variables validated for production');
  }

  private validateJWTSecret(secret: string | undefined, varName: string): string {
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isProduction) {
      if (!secret) {
        throw new Error(`FATAL: ${varName} environment variable is required in production`);
      }
      
      // Validate secret strength
      if (secret.length < 32) {
        throw new Error(`FATAL: ${varName} must be at least 32 characters long in production`);
      }
      
      // Check for weak secrets
      const weakSecrets = [
        'secret', 'password', 'your-secret', 'jwt-secret', 'change-me',
        'your-super-secret-jwt-key-change-in-production',
        'your-super-secret-refresh-key-change-in-production',
        'dev-jwt-secret', 'dev-refresh-secret'
      ];
      
      if (weakSecrets.some(weak => secret.toLowerCase().includes(weak))) {
        throw new Error(`FATAL: ${varName} appears to contain weak/default values. Use a cryptographically secure random string.`);
      }
      
      return secret;
    } else {
      // Development fallback with clear warning
      const fallback = `dev-${varName.toLowerCase().replace('_', '-')}-not-for-production`;
      if (!secret) {
        console.warn(`⚠️  WARNING: Using development ${varName}. NEVER use in production!`);
        return fallback;
      }
      return secret;
    }
  }

  private validateAdminApiKey(apiKey: string | undefined): string {
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isProduction) {
      if (!apiKey) {
        throw new Error('FATAL: ADMIN_API_KEY environment variable is required in production');
      }
      
      // Validate API key strength
      if (apiKey.length < 24) {
        throw new Error('FATAL: ADMIN_API_KEY must be at least 24 characters long in production');
      }
      
      // Check for weak API keys
      const weakKeys = [
        'admin', 'password', 'key', 'secret', 'change-me', 'api-key',
        '123456', 'admin123', 'adminkey'
      ];
      
      if (weakKeys.some(weak => apiKey.toLowerCase().includes(weak))) {
        throw new Error('FATAL: ADMIN_API_KEY appears to contain weak/default values. Use a cryptographically secure random string.');
      }
      
      return apiKey;
    } else {
      // Development fallback
      const fallback = 'dev-admin-api-key-not-for-production';
      if (!apiKey) {
        console.warn('⚠️  WARNING: Using development ADMIN_API_KEY. NEVER use in production!');
        return fallback;
      }
      return apiKey;
    }
  }

  public getConfig(): EnvironmentConfig {
    return { ...this.config };
  }

  public isProduction(): boolean {
    return this.config.NODE_ENV === 'production';
  }

  public isDevelopment(): boolean {
    return this.config.NODE_ENV === 'development';
  }

  // Secure logging that never exposes sensitive values
  public logConfiguration(): void {
    if (this.isProduction()) {
      console.info('🔒 Production environment configuration loaded successfully');
    } else {
      console.info('🔧 Development environment configuration:', {
        NODE_ENV: this.config.NODE_ENV,
        PORT: this.config.PORT,
        hasDatabase: !!this.config.DATABASE_URL,
        hasClientUrl: !!this.config.CLIENT_URL,
        hasJwtSecret: !!this.config.JWT_SECRET,
        hasRefreshSecret: !!this.config.JWT_REFRESH_SECRET,
        hasAdminKey: !!this.config.ADMIN_API_KEY
      });
    }
  }
}

// Export singleton instance
export const env = new EnvironmentValidator();
export const config = env.getConfig();