# Production Security Implementation Guide

## What Was Added

### 1. ✅ Rate Limiting (`lib/rate-limiter.ts`)

- **Limits**: 5 login attempts per 15 minutes per username
- **Protection**: Prevents brute force attacks
- **Storage**: In-memory (for production with multiple servers, use Redis)

### 2. ✅ Security Logging (`lib/security-logger.ts`)

- Logs all authentication events:
  - Login success/failure
  - Rate limiting triggers
  - Account lockouts
- Ready for integration with logging services (Sentry, Datadog, CloudWatch)

### 3. ✅ Account Lockout (`lib/account-lockout.ts`)

- **Limits**: Account locked for 30 minutes after 5 failed attempts
- **Database-backed**: Survives server restarts
- **Auto-unlock**: Automatically unlocks after timeout

### 4. ✅ Secure Cookies & HTTPS

- **Production**: Cookies are HTTPS-only and prefixed with `__Secure-`
- **httpOnly**: Prevents XSS attacks
- **sameSite**: CSRF protection

## Setup Steps

### Step 1: Run Database Migration

```bash
npx prisma migrate dev --name add_security_fields
```

This adds these fields to User table:

- `failedLoginAttempts` - Track failed login count
- `lockedUntil` - Account lockout timestamp
- `lastLoginAt` - Last successful login

### Step 2: Update Environment Variables

Add to your `.env` file:

```env
# For production, change to your domain
NEXTAUTH_URL="https://yourdomain.com"

# Generate new secret with: openssl rand -base64 32
NEXTAUTH_SECRET="your-secret-here"

# Database
DATABASE_URL="postgresql://..."

# Optional: Set to 'production' when deploying
NODE_ENV="production"
```

### Step 3: Test Locally

```bash
# Start your app
npm run dev

# Try logging in with wrong password 6 times
# - First 5: "Invalid username or password"
# - 6th: "Too many login attempts. Try again in X minutes"

# Try wrong password on existing user 6 times
# - 6th: "Account locked due to multiple failed login attempts"
```

## Production Deployment Checklist

### Before Deployment:

- [ ] Set `NODE_ENV=production`
- [ ] Set `NEXTAUTH_URL` to your production domain (must be HTTPS)
- [ ] Generate strong `NEXTAUTH_SECRET` (`openssl rand -base64 32`)
- [ ] Run database migrations on production
- [ ] Verify HTTPS is configured on your hosting

### After Deployment:

- [ ] Test login functionality
- [ ] Test rate limiting (5 failed attempts)
- [ ] Check security logs are being created
- [ ] Verify cookies are secure (check browser dev tools)

## Advanced Configuration

### 1. Adjust Rate Limiting

Edit `lib/rate-limiter.ts`:

```typescript
// Change from 5 attempts / 15 minutes to 10 attempts / 5 minutes
export const loginRateLimiter = new RateLimiter(10, 5);
```

### 2. Adjust Account Lockout

Edit `lib/account-lockout.ts`:

```typescript
// Change lockout duration from 30 to 60 minutes
const LOCKOUT_DURATION_MINUTES = 60;

// Change max attempts from 5 to 3
const MAX_FAILED_ATTEMPTS = 3;
```

### 3. Integrate External Logging

Edit `lib/security-logger.ts` to send logs to your service:

**Sentry:**

```typescript
import * as Sentry from "@sentry/nextjs";

if (process.env.NODE_ENV === "production") {
  Sentry.captureMessage(JSON.stringify(logEntry), "info");
}
```

**Datadog:**

```typescript
import { logger } from "@datadog/browser-logs";

if (process.env.NODE_ENV === "production") {
  logger.info("Security Event", logEntry);
}
```

### 4. Use Redis for Rate Limiting (Multi-Server)

Install:

```bash
npm install ioredis
```

Replace in `lib/rate-limiter.ts`:

```typescript
import Redis from "ioredis";
const redis = new Redis(process.env.REDIS_URL);

// Use Redis instead of Map for distributed rate limiting
```

## Security Headers (Bonus)

Add to `next.config.ts`:

```typescript
const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};
```

## Monitoring

Watch these metrics in production:

- **Failed login rate**: High rate might indicate attack
- **Account lockouts**: Monitor for unusual patterns
- **Rate limit triggers**: Track potential attackers
- **Session duration**: Unusual patterns might indicate session theft

## Troubleshooting

### Users Can't Login After Deployment

- Check `NEXTAUTH_URL` matches your domain
- Verify `NEXTAUTH_SECRET` is set
- Ensure database migration ran successfully
- Check if account is locked (wait 30 min or manually unlock)

### Rate Limiting Not Working

- In-memory limiter resets on server restart
- For multi-server: implement Redis-backed limiter
- Check if identifier (username) is consistent

### Cookies Not Secure

- Verify `NODE_ENV=production`
- Ensure site is served over HTTPS
- Check browser dev tools → Application → Cookies

## Need Help?

- Check security logs: Look for error patterns
- Test locally: Run `NODE_ENV=development npm run dev`
- Database check: `npx prisma studio` to view user lockout status
