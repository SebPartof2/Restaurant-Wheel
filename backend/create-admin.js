// Quick script to create an admin user
// Run with: node create-admin.js

const password = process.argv[2] || 'changeme123';
const email = process.argv[3] || 'sebpartof2@gmail.com';

// Simple hash function (you should use bcrypt in production)
// For now, we'll just show the SQL command
console.log(`
Run this command to create your admin account:

wrangler d1 execute restaurant-wheel-db --remote --command "INSERT INTO users (email, password_hash, is_admin, is_whitelisted, created_at, updated_at) VALUES ('${email}', 'temp_password_will_change', 1, 1, datetime('now'), datetime('now'))"

Then:
1. Visit your site
2. Click "Login"
3. Try to login with email: ${email}
4. Click "Forgot Password" or "Sign Up" to set your actual password

OR you can set a password directly. Let me know if you want to hash a password properly.
`);
