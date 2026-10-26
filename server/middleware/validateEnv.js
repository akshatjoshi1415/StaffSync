/**
 * Validate required environment variables at server startup.
 * Ensures the application does not start with incomplete or unsafe configuration.
 * Never prints secret values to logs.
 */
function validateEnv() {
  const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
  const missing = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar] || process.env[envVar].trim() === '') {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    console.error('\n========================================');
    console.error(' [STARTUP ERROR] Missing Required Environment Variables:');
    missing.forEach((variable) => {
      console.error(`  - ${variable}`);
    });
    console.error(' Please configure them in your server/.env file.');
    console.error('========================================\n');
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Security warning: ensure default placeholder is not used in production
  if (
    process.env.NODE_ENV === 'production' &&
    (process.env.JWT_SECRET === 'REPLACE_WITH_A_STRONG_RANDOM_SECRET' ||
      process.env.JWT_SECRET === 'your_jwt_secret_key_here')
  ) {
    console.error('\n========================================');
    console.error(' [SECURITY ERROR] Insecure JWT_SECRET detected in production!');
    console.error(' Please set a strong, cryptographically secure secret.');
    console.error('========================================\n');
    throw new Error('Insecure JWT_SECRET configured in production environment');
  }
}

module.exports = validateEnv;
