const {
	REQUIRED_ENV_VARS,
	validateEnvVars,
	getCorsConfig,
	getSessionConfig,
	getEmailTransporterConfig,
	getSocketIOCorsConfig
} = require('../config/security');

describe('Security Configuration Module', () => {
	describe('REQUIRED_ENV_VARS', () => {
		it('should contain all required environment variables', () => {
			expect(REQUIRED_ENV_VARS).toContain('SESSION_SECRET');
			expect(REQUIRED_ENV_VARS).toContain('EMAIL_ADDRESS');
			expect(REQUIRED_ENV_VARS).toContain('EMAIL_PASSWORD');
			expect(REQUIRED_ENV_VARS).toContain('CLIENT_URL');
			expect(REQUIRED_ENV_VARS).toHaveLength(4);
		});
	});

	describe('validateEnvVars', () => {
		it('should return valid when all required env vars are present', () => {
			const mockEnv = {
				SESSION_SECRET: 'test-secret',
				EMAIL_ADDRESS: 'test@example.com',
				EMAIL_PASSWORD: 'test-password',
				CLIENT_URL: 'http://localhost:3000'
			};

			const result = validateEnvVars(mockEnv);

			expect(result.isValid).toBe(true);
			expect(result.missingVars).toHaveLength(0);
		});

		it('should return invalid when SESSION_SECRET is missing', () => {
			const mockEnv = {
				EMAIL_ADDRESS: 'test@example.com',
				EMAIL_PASSWORD: 'test-password',
				CLIENT_URL: 'http://localhost:3000'
			};

			const result = validateEnvVars(mockEnv);

			expect(result.isValid).toBe(false);
			expect(result.missingVars).toContain('SESSION_SECRET');
		});

		it('should return invalid when EMAIL_ADDRESS is missing', () => {
			const mockEnv = {
				SESSION_SECRET: 'test-secret',
				EMAIL_PASSWORD: 'test-password',
				CLIENT_URL: 'http://localhost:3000'
			};

			const result = validateEnvVars(mockEnv);

			expect(result.isValid).toBe(false);
			expect(result.missingVars).toContain('EMAIL_ADDRESS');
		});

		it('should return invalid when EMAIL_PASSWORD is missing', () => {
			const mockEnv = {
				SESSION_SECRET: 'test-secret',
				EMAIL_ADDRESS: 'test@example.com',
				CLIENT_URL: 'http://localhost:3000'
			};

			const result = validateEnvVars(mockEnv);

			expect(result.isValid).toBe(false);
			expect(result.missingVars).toContain('EMAIL_PASSWORD');
		});

		it('should return invalid when CLIENT_URL is missing', () => {
			const mockEnv = {
				SESSION_SECRET: 'test-secret',
				EMAIL_ADDRESS: 'test@example.com',
				EMAIL_PASSWORD: 'test-password'
			};

			const result = validateEnvVars(mockEnv);

			expect(result.isValid).toBe(false);
			expect(result.missingVars).toContain('CLIENT_URL');
		});

		it('should return all missing vars when multiple are missing', () => {
			const mockEnv = {};

			const result = validateEnvVars(mockEnv);

			expect(result.isValid).toBe(false);
			expect(result.missingVars).toHaveLength(4);
			expect(result.missingVars).toContain('SESSION_SECRET');
			expect(result.missingVars).toContain('EMAIL_ADDRESS');
			expect(result.missingVars).toContain('EMAIL_PASSWORD');
			expect(result.missingVars).toContain('CLIENT_URL');
		});

		it('should treat empty string values as missing', () => {
			const mockEnv = {
				SESSION_SECRET: '',
				EMAIL_ADDRESS: 'test@example.com',
				EMAIL_PASSWORD: 'test-password',
				CLIENT_URL: 'http://localhost:3000'
			};

			const result = validateEnvVars(mockEnv);

			expect(result.isValid).toBe(false);
			expect(result.missingVars).toContain('SESSION_SECRET');
		});
	});

	describe('getCorsConfig', () => {
		it('should return CORS config with CLIENT_URL as origin', () => {
			const mockEnv = {
				CLIENT_URL: 'http://localhost:3000'
			};

			const config = getCorsConfig(mockEnv);

			expect(config.origin).toBe('http://localhost:3000');
			expect(config.credentials).toBe(true);
		});

		it('should handle production CLIENT_URL', () => {
			const mockEnv = {
				CLIENT_URL: 'https://zuv.example.com'
			};

			const config = getCorsConfig(mockEnv);

			expect(config.origin).toBe('https://zuv.example.com');
			expect(config.credentials).toBe(true);
		});

		it('should return undefined origin when CLIENT_URL is not set', () => {
			const mockEnv = {};

			const config = getCorsConfig(mockEnv);

			expect(config.origin).toBeUndefined();
			expect(config.credentials).toBe(true);
		});
	});

	describe('getSessionConfig', () => {
		it('should return session config with correct secret', () => {
			const mockEnv = {
				SESSION_SECRET: 'my-super-secret-key',
				NODE_ENV: 'development'
			};

			const config = getSessionConfig(mockEnv);

			expect(config.secret).toBe('my-super-secret-key');
		});

		it('should have saveUninitialized set to true', () => {
			const mockEnv = {
				SESSION_SECRET: 'test-secret',
				NODE_ENV: 'development'
			};

			const config = getSessionConfig(mockEnv);

			expect(config.saveUninitialized).toBe(true);
		});

		it('should have resave set to true', () => {
			const mockEnv = {
				SESSION_SECRET: 'test-secret',
				NODE_ENV: 'development'
			};

			const config = getSessionConfig(mockEnv);

			expect(config.resave).toBe(true);
		});

		it('should have httpOnly cookie set to true', () => {
			const mockEnv = {
				SESSION_SECRET: 'test-secret',
				NODE_ENV: 'development'
			};

			const config = getSessionConfig(mockEnv);

			expect(config.cookie.httpOnly).toBe(true);
		});

		it('should have sameSite cookie set to strict', () => {
			const mockEnv = {
				SESSION_SECRET: 'test-secret',
				NODE_ENV: 'development'
			};

			const config = getSessionConfig(mockEnv);

			expect(config.cookie.sameSite).toBe('strict');
		});

		it('should have maxAge set to 24 hours in milliseconds', () => {
			const mockEnv = {
				SESSION_SECRET: 'test-secret',
				NODE_ENV: 'development'
			};

			const config = getSessionConfig(mockEnv);

			expect(config.cookie.maxAge).toBe(24 * 60 * 60 * 1000);
		});

		it('should have secure cookie set to false in development', () => {
			const mockEnv = {
				SESSION_SECRET: 'test-secret',
				NODE_ENV: 'development'
			};

			const config = getSessionConfig(mockEnv);

			expect(config.cookie.secure).toBe(false);
		});

		it('should have secure cookie set to true in production', () => {
			const mockEnv = {
				SESSION_SECRET: 'test-secret',
				NODE_ENV: 'production'
			};

			const config = getSessionConfig(mockEnv);

			expect(config.cookie.secure).toBe(true);
		});

		it('should have secure cookie set to false when NODE_ENV is not set', () => {
			const mockEnv = {
				SESSION_SECRET: 'test-secret'
			};

			const config = getSessionConfig(mockEnv);

			expect(config.cookie.secure).toBe(false);
		});
	});

	describe('getEmailTransporterConfig', () => {
		it('should return config with gmail service', () => {
			const mockEnv = {
				EMAIL_ADDRESS: 'test@gmail.com',
				EMAIL_PASSWORD: 'app-password'
			};

			const config = getEmailTransporterConfig(mockEnv);

			expect(config.service).toBe('gmail');
		});

		it('should return config with correct email address', () => {
			const mockEnv = {
				EMAIL_ADDRESS: 'test@gmail.com',
				EMAIL_PASSWORD: 'app-password'
			};

			const config = getEmailTransporterConfig(mockEnv);

			expect(config.auth.user).toBe('test@gmail.com');
		});

		it('should return config with correct email password', () => {
			const mockEnv = {
				EMAIL_ADDRESS: 'test@gmail.com',
				EMAIL_PASSWORD: 'app-password'
			};

			const config = getEmailTransporterConfig(mockEnv);

			expect(config.auth.pass).toBe('app-password');
		});

		it('should return undefined auth values when env vars are not set', () => {
			const mockEnv = {};

			const config = getEmailTransporterConfig(mockEnv);

			expect(config.auth.user).toBeUndefined();
			expect(config.auth.pass).toBeUndefined();
		});
	});

	describe('getSocketIOCorsConfig', () => {
		it('should return config with cors object', () => {
			const mockEnv = {
				CLIENT_URL: 'http://localhost:3000'
			};

			const config = getSocketIOCorsConfig(mockEnv);

			expect(config).toHaveProperty('cors');
		});

		it('should return config with CLIENT_URL as cors origin', () => {
			const mockEnv = {
				CLIENT_URL: 'http://localhost:3000'
			};

			const config = getSocketIOCorsConfig(mockEnv);

			expect(config.cors.origin).toBe('http://localhost:3000');
		});

		it('should return config with credentials set to true', () => {
			const mockEnv = {
				CLIENT_URL: 'http://localhost:3000'
			};

			const config = getSocketIOCorsConfig(mockEnv);

			expect(config.cors.credentials).toBe(true);
		});

		it('should handle production CLIENT_URL', () => {
			const mockEnv = {
				CLIENT_URL: 'https://zuv.example.com'
			};

			const config = getSocketIOCorsConfig(mockEnv);

			expect(config.cors.origin).toBe('https://zuv.example.com');
			expect(config.cors.credentials).toBe(true);
		});

		it('should return undefined origin when CLIENT_URL is not set', () => {
			const mockEnv = {};

			const config = getSocketIOCorsConfig(mockEnv);

			expect(config.cors.origin).toBeUndefined();
			expect(config.cors.credentials).toBe(true);
		});
	});
});
