import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { dbStore } from '../db.js';
import { OtpService } from '../services/otp.js';
import { LedgerService } from '../services/ledger.js';
import { AuthenticatedRequest, generateToken } from '../middleware/auth.js';
import { IUser, IProfile } from '../types.js';

// Generate 8-character unique referral code
function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export class AuthController {
  public static async sendOtp(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { phone, purpose } = req.body;
      if (!phone || phone.length < 10) {
        res.status(400).json({ error: 'Valid 10-digit mobile number is required.' });
        return;
      }
      const result = await OtpService.sendOtp(phone, purpose || 'REGISTRATION');
      if (!result.success) {
        res.status(429).json({ error: result.message });
        return;
      }
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to send OTP' });
    }
  }

  public static async register(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { phone, password, otpCode, referralCode } = req.body;
      const cleanPhone = phone?.replace(/[^0-9]/g, '');

      if (!cleanPhone || cleanPhone.length !== 10) {
        res.status(400).json({ error: 'Please enter a valid 10-digit mobile number.' });
        return;
      }
      if (!password || password.length < 6) {
        res.status(400).json({ error: 'Password must be at least 6 characters long.' });
        return;
      }

      // Verify OTP
      const otpCheck = OtpService.verifyOtp(cleanPhone, 'REGISTRATION', otpCode || '');
      if (!otpCheck.valid) {
        res.status(400).json({ error: otpCheck.message || 'Invalid or expired OTP.' });
        return;
      }

      const state = dbStore.getState();
      const existing = state.users.find(u => u.phone === cleanPhone);
      if (existing) {
        res.status(409).json({ error: 'An account with this phone number already exists.' });
        return;
      }

      // Referral attribution
      let referrerId: string | null = null;
      if (referralCode && referralCode.trim()) {
        const referrer = state.users.find(u => u.referralCode.toUpperCase() === referralCode.trim().toUpperCase());
        if (referrer && referrer.phone !== cleanPhone) {
          referrerId = referrer.id;
        }
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const userRefCode = generateReferralCode();
      const now = new Date().toISOString();

      const user: IUser = {
        id: uuidv4(),
        phone: cleanPhone,
        passwordHash,
        role: 'USER',
        status: 'ACTIVE',
        referralCode: userRefCode,
        referredById: referrerId,
        createdAt: now,
        updatedAt: now
      };

      const profile: IProfile = {
        id: uuidv4(),
        userId: user.id,
        nickname: `User_${cleanPhone.slice(-4)}`,
        avatar: '',
        createdAt: now,
        updatedAt: now
      };

      state.users.push(user);
      state.profiles.push(profile);
      dbStore.save();

      // Initialize wallet with Welcome Bonus
      const welcomeBonus = state.settings['WELCOME_BONUS_MCOIN'] || '20.0000';
      LedgerService.credit({
        userId: user.id,
        amount: welcomeBonus,
        type: 'WELCOME_BONUS',
        referenceType: 'USER_REGISTRATION',
        referenceId: user.id,
        description: 'New User Welcome Reward'
      });

      const token = generateToken(user);
      const wallet = LedgerService.getWallet(user.id);

      res.status(201).json({
        message: 'Account registered successfully!',
        token,
        user: {
          id: user.id,
          phone: user.phone,
          role: user.role,
          referralCode: user.referralCode,
          profile
        },
        wallet
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Registration failed.' });
    }
  }

  public static async login(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { phone, password, otpLogin, otpCode } = req.body;
      const cleanPhone = phone?.replace(/[^0-9]/g, '');

      if (!cleanPhone) {
        res.status(400).json({ error: 'Mobile number is required.' });
        return;
      }

      const state = dbStore.getState();
      const user = state.users.find(u => u.phone === cleanPhone);

      if (!user) {
        res.status(404).json({ error: 'No account found with this phone number. Please register.' });
        return;
      }

      if (user.status === 'BLOCKED' || user.status === 'SUSPENDED') {
        res.status(403).json({ error: 'This account has been disabled. Contact support.' });
        return;
      }

      if (otpLogin) {
        const otpCheck = OtpService.verifyOtp(cleanPhone, 'LOGIN', otpCode || '');
        if (!otpCheck.valid) {
          res.status(400).json({ error: otpCheck.message || 'Invalid or expired OTP.' });
          return;
        }
      } else {
        if (!password) {
          res.status(400).json({ error: 'Password is required.' });
          return;
        }
        const matches = await bcrypt.compare(password, user.passwordHash);
        if (!matches) {
          res.status(401).json({ error: 'Incorrect password. Please try again.' });
          return;
        }
      }

      const token = generateToken(user);
      const profile = state.profiles.find(p => p.userId === user.id);
      const wallet = LedgerService.getWallet(user.id);

      res.json({
        message: 'Logged in successfully!',
        token,
        user: {
          id: user.id,
          phone: user.phone,
          role: user.role,
          referralCode: user.referralCode,
          profile
        },
        wallet
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Login failed.' });
    }
  }

  public static async forgotPassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { phone, otpCode, newPassword } = req.body;
      const cleanPhone = phone?.replace(/[^0-9]/g, '');

      if (!cleanPhone || !newPassword || newPassword.length < 6) {
        res.status(400).json({ error: 'Valid phone and new password (min 6 chars) are required.' });
        return;
      }

      const otpCheck = OtpService.verifyOtp(cleanPhone, 'PASSWORD_RESET', otpCode || '');
      if (!otpCheck.valid) {
        res.status(400).json({ error: otpCheck.message || 'Invalid OTP code.' });
        return;
      }

      const state = dbStore.getState();
      const user = state.users.find(u => u.phone === cleanPhone);
      if (!user) {
        res.status(404).json({ error: 'User not found.' });
        return;
      }

      user.passwordHash = await bcrypt.hash(newPassword, 10);
      user.updatedAt = new Date().toISOString();
      dbStore.save();

      res.json({ message: 'Password reset successfully! Please login with your new password.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Password reset failed.' });
    }
  }

  public static async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const state = dbStore.getState();
      const profile = state.profiles.find(p => p.userId === req.user!.id);
      const wallet = LedgerService.getWallet(req.user.id);

      res.json({
        user: {
          id: req.user.id,
          phone: req.user.phone,
          role: req.user.role,
          referralCode: req.user.referralCode,
          profile
        },
        wallet,
        settings: {
          INR_TO_MCOIN_RATE: state.settings['INR_TO_MCOIN_RATE'] || '1.0',
          USDT_TO_MCOIN_RATE: state.settings['USDT_TO_MCOIN_RATE'] || '110.5'
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch user data.' });
    }
  }

  public static async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { upiId, bankHolderName, bankAccount, bankIfsc, usdtTrc20, nickname } = req.body;
      const state = dbStore.getState();
      let profile = state.profiles.find(p => p.userId === req.user!.id);

      if (!profile) {
        profile = {
          id: uuidv4(),
          userId: req.user.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        state.profiles.push(profile);
      }

      if (upiId !== undefined) profile.upiId = upiId.trim();
      if (bankHolderName !== undefined) profile.bankHolderName = bankHolderName.trim();
      if (bankAccount !== undefined) profile.bankAccount = bankAccount.trim();
      if (bankIfsc !== undefined) profile.bankIfsc = bankIfsc.trim();
      if (usdtTrc20 !== undefined) profile.usdtTrc20 = usdtTrc20.trim();
      if (nickname !== undefined) profile.nickname = nickname.trim();
      profile.updatedAt = new Date().toISOString();

      dbStore.save();
      res.json({ message: 'Profile updated successfully!', profile });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to update profile.' });
    }
  }
}
