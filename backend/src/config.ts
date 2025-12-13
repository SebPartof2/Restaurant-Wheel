// Application configuration

export const config = {
  // Admin email addresses (hardcoded)
  adminEmails: [
    'sebpartof2@gmail.com',
    // Add your admin emails here
  ],

  // Email whitelist (can also be managed via admin panel)
  emailWhitelist: [
    'sebpartof2@gmail.com',
    // Add whitelisted emails here
  ],

  // Session configuration
  session: {
    expiryDays: 30,
    cookieName: 'wheel_session',
  },

  // Password requirements
  password: {
    minLength: 8,
  },
};

export function isAdminEmail(email: string): boolean {
  return config.adminEmails.includes(email.toLowerCase());
}

export function isWhitelistedEmail(email: string): boolean {
  return config.emailWhitelist.includes(email.toLowerCase());
}
