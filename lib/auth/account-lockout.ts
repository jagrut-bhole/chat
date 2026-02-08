import prisma from "../prisma";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 30;

export class AccountLockout {
  /**
   * Check if account is locked
   */
  static async isLocked(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { lockedUntil: true },
    });

    if (!user?.lockedUntil) return false;

    const now = new Date();
    if (now < user.lockedUntil) {
      return true; // Still locked
    }

    // Lock expired, reset it
    await this.unlock(userId);
    return false;
  }

  /**
   * Record failed login attempt
   * Returns true if account is now locked
   */
  static async recordFailedAttempt(userId: string): Promise<boolean> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: { increment: 1 },
      },
      select: { failedLoginAttempts: true },
    });

    // Lock account if max attempts reached
    if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
      const lockUntil = new Date();
      lockUntil.setMinutes(lockUntil.getMinutes() + LOCKOUT_DURATION_MINUTES);

      await prisma.user.update({
        where: { id: userId },
        data: {
          lockedUntil: lockUntil,
        },
      });

      return true; // Account is now locked
    }

    return false;
  }

  /**
   * Reset failed attempts after successful login
   */
  static async resetFailedAttempts(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });
  }

  /**
   * Unlock an account (admin function or after lockout expires)
   */
  static async unlock(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });
  }

  /**
   * Get remaining lockout time in minutes
   */
  static async getRemainingLockoutTime(userId: string): Promise<number> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { lockedUntil: true },
    });

    if (!user?.lockedUntil) return 0;

    const now = new Date();
    const remaining = user.lockedUntil.getTime() - now.getTime();
    return Math.max(0, Math.ceil(remaining / 60000)); // Convert to minutes
  }
}
