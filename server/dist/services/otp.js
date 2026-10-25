import { dbStore } from '../db.js';
import { v4 as uuidv4 } from 'uuid';
export class OtpService {
    static OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
    static MAX_ATTEMPTS = 5;
    static async sendOtp(phone, purpose) {
        const state = dbStore.getState();
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        // Rate limiting: check recent OTP for this phone within 60 seconds
        const existing = state.otps.filter(o => o.phone === cleanPhone && o.purpose === purpose && !o.verified);
        const recent = existing.find(o => {
            const created = new Date(o.expiresAt).getTime() - this.OTP_EXPIRY_MS;
            return Date.now() - created < 60000;
        });
        if (recent) {
            return { success: false, message: 'Please wait 60 seconds before requesting another OTP.' };
        }
        // Invalidate old pending OTPs for this phone and purpose
        state.otps = state.otps.filter(o => !(o.phone === cleanPhone && o.purpose === purpose && !o.verified));
        // Generate random 6-digit OTP
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MS).toISOString();
        state.otps.push({
            id: uuidv4(),
            phone: cleanPhone,
            code,
            purpose,
            expiresAt,
            verified: false,
            attempts: 0
        });
        dbStore.save();
        const isMock = process.env.SMS_MOCK_MODE === 'true' || state.settings['SMS_MOCK_MODE'] === 'true' || process.env.NODE_ENV !== 'production';
        console.log(`[OTP] Generated OTP for ${cleanPhone} (${purpose}): ${code} (Mock Mode: ${isMock})`);
        return {
            success: true,
            message: isMock ? `Dev Mock OTP sent: ${code}` : 'OTP sent successfully to your mobile number.',
            mockOtp: isMock ? code : undefined
        };
    }
    static verifyOtp(phone, purpose, inputCode) {
        const state = dbStore.getState();
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        const record = state.otps.find(o => o.phone === cleanPhone && o.purpose === purpose && !o.verified);
        if (!record) {
            return { valid: false, message: 'No active OTP found. Please request a new OTP.' };
        }
        if (new Date(record.expiresAt).getTime() < Date.now()) {
            return { valid: false, message: 'OTP has expired. Please request a new one.' };
        }
        record.attempts += 1;
        if (record.attempts > this.MAX_ATTEMPTS) {
            // Invalidate
            state.otps = state.otps.filter(o => o.id !== record.id);
            dbStore.save();
            return { valid: false, message: 'Maximum verification attempts exceeded. Please request a new OTP.' };
        }
        if (record.code !== inputCode.trim()) {
            dbStore.save();
            return { valid: false, message: `Invalid OTP code. ${this.MAX_ATTEMPTS - record.attempts} attempts remaining.` };
        }
        // Mark verified and consumed (one-time use)
        record.verified = true;
        dbStore.save();
        return { valid: true };
    }
}
