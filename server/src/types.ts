export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'BLOCKED';
export type OrderType = 'INR_BUY' | 'USDT_BUY' | 'SELL_WITHDRAWAL';
export type OrderStatus = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type SubmissionStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
export type LedgerType = 
  | 'DEPOSIT_CREDIT'
  | 'WITHDRAWAL_DEBIT'
  | 'TASK_REWARD'
  | 'REFERRAL_COMMISSION'
  | 'WELCOME_BONUS'
  | 'ADMIN_ADJUSTMENT'
  | 'PURCHASE_DEBIT';

export interface IUser {
  id: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  referralCode: string;
  referredById?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IProfile {
  id: string;
  userId: string;
  nickname?: string;
  avatar?: string;
  upiId?: string;
  bankHolderName?: string;
  bankAccount?: string;
  bankIfsc?: string;
  usdtTrc20?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IWallet {
  id: string;
  userId: string;
  mcoinBalance: string; // Decimal string e.g. "20.0000"
  lockedBalance: string;
  totalEarned: string;
  totalWithdrawn: string;
  todayEarnings: string;
  todayDate: string; // YYYY-MM-DD
  version: number;
}

export interface ILedgerTransaction {
  id: string;
  walletId: string;
  userId: string;
  type: LedgerType;
  amount: string;
  balanceBefore: string;
  balanceAfter: string;
  referenceType: string;
  referenceId?: string;
  description: string;
  adminId?: string;
  createdAt: string;
}

export interface IOrder {
  id: string;
  orderNumber: string;
  userId: string;
  type: OrderType;
  tier?: string;
  fiatAmount: string;
  currency: string;
  rateApplied: string;
  rewardMcoin: string;
  totalMcoin: string;
  network?: string;
  depositAddress?: string;
  utrNumber?: string;
  proofImage?: string;
  status: OrderStatus;
  adminNote?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ITask {
  id: string;
  title: string;
  category: string;
  rewardMcoin: string;
  icon?: string;
  instructions: string;
  requirements: string;
  link?: string;
  status: 'AVAILABLE' | 'PAUSED' | 'EXPIRED';
  maxSubmissions: number;
  currentSubmissions: number;
}

export interface ITaskSubmission {
  id: string;
  taskId: string;
  userId: string;
  proofText?: string;
  proofImage?: string;
  status: SubmissionStatus;
  rewardCredited: string;
  adminFeedback?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IAppSetting {
  key: string;
  value: string;
  description?: string;
}

export interface IAdminAuditLog {
  id: string;
  adminId: string;
  action: string;
  targetType: string;
  targetId?: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}
