import test from 'node:test';
import assert from 'node:assert/strict';
import { Money } from '../dist/utils/money.js';
import { OtpService } from '../dist/services/otp.js';
import { LedgerService } from '../dist/services/ledger.js';
import { dbStore } from '../dist/db.js';

test('1. Money Utility - Arbitrary precision without IEEE-754 drift', () => {
  const m1 = new Money('0.1000');
  const m2 = new Money('0.2000');
  const sum = m1.add(m2);
  assert.equal(sum.toString(), '0.3000', '0.1 + 0.2 must equal 0.3000 exactly');

  const order = new Money('641.0000');
  const reward = new Money('25.2300');
  const total = order.add(reward);
  assert.equal(total.toString(), '666.2300', '641 + 25.23 must equal 666.2300');

  // Subtraction & Insufficient balance check
  const balance = new Money('100.0000');
  assert.equal(balance.gte('50.0000'), true);
  assert.equal(balance.lt('150.0000'), true);
});

test('2. OTP Service - Mock generation, verification and single-use consumption', async () => {
  const phone = '9999888811';
  const res = await OtpService.sendOtp(phone, 'REGISTRATION');
  assert.equal(res.success, true);
  assert.ok(res.mockOtp, 'Mock OTP should be returned in development mode');

  // Verify with wrong OTP
  const wrongCheck = OtpService.verifyOtp(phone, 'REGISTRATION', '000000');
  assert.equal(wrongCheck.valid, false);

  // Verify with correct OTP
  const correctCheck = OtpService.verifyOtp(phone, 'REGISTRATION', res.mockOtp);
  assert.equal(correctCheck.valid, true);

  // Second attempt with same OTP must fail (One-time use)
  const reuseCheck = OtpService.verifyOtp(phone, 'REGISTRATION', res.mockOtp);
  assert.equal(reuseCheck.valid, false, 'OTP must not be reusable');
});

test('3. Ledger Service - Atomic Credit and Debit', () => {
  const testUserId = 'test-user-' + Date.now();
  
  // Credit
  const creditRes = LedgerService.credit({
    userId: testUserId,
    amount: '100.0000',
    type: 'WELCOME_BONUS',
    referenceType: 'TEST',
    description: 'Test Credit'
  });

  assert.equal(creditRes.wallet.mcoinBalance, '100.0000');

  // Debit valid
  const debitRes = LedgerService.debit({
    userId: testUserId,
    amount: '30.0000',
    type: 'PURCHASE_DEBIT',
    referenceType: 'TEST',
    description: 'Test Debit'
  });

  assert.equal(debitRes.wallet.mcoinBalance, '70.0000');

  // Debit overdraft (must throw)
  assert.throws(() => {
    LedgerService.debit({
      userId: testUserId,
      amount: '900.0000',
      type: 'WITHDRAWAL_DEBIT',
      referenceType: 'TEST',
      description: 'Overdraft test'
    });
  }, /Insufficient Mcoin balance/);
});

test('4. Referral Commission calculation accuracy (0.3%)', () => {
  const orderAmount = new Money('100000.0000'); // ₹100,000 spend
  const commission = orderAmount.mul('0.003');  // 0.3%
  assert.equal(commission.toString(), '300.0000', '0.3% of 100,000 is 300 Mcoin');

  // 20 friends each spend 100,000 => 20 * 300 = 6,000 Mcoin (matches screenshot banner!)
  const totalComm = commission.mul('20.0000');
  assert.equal(totalComm.toString(), '6000.0000', '20 friends * 300 = 6,000 Mcoin');
});
