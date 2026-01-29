const REQUIRED_ENV_VARS = ['SESSION_SECRET', 'EMAIL_ADDRESS', 'EMAIL_PASSWORD', 'CLIENT_URL'];

function validateEnvVars(env = process.env) {
	const missingEnvVars = REQUIRED_ENV_VARS.filter(envVar => !env[envVar]);
	return {
		isValid: missingEnvVars.length === 0,
		missingVars: missingEnvVars
	};
}

function getCorsConfig(env = process.env) {
	return {
		origin: env.CLIENT_URL,
		credentials: true
	};
}

function getSessionConfig(env = process.env) {
	return {
		secret: env.SESSION_SECRET,
		saveUninitialized: true,
		resave: true,
		cookie: {
			httpOnly: true,
			sameSite: 'strict',
			maxAge: 24 * 60 * 60 * 1000,
			secure: env.NODE_ENV === 'production'
		}
	};
}

function getEmailTransporterConfig(env = process.env) {
	return {
		service: 'gmail',
		auth: {
			user: env.EMAIL_ADDRESS,
			pass: env.EMAIL_PASSWORD
		}
	};
}

function getSocketIOCorsConfig(env = process.env) {
	return {
		cors: {
			origin: env.CLIENT_URL,
			credentials: true
		}
	};
}

module.exports = {
	REQUIRED_ENV_VARS,
	validateEnvVars,
	getCorsConfig,
	getSessionConfig,
	getEmailTransporterConfig,
	getSocketIOCorsConfig
};
