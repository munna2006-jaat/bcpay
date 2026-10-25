export interface IUser {
  id: string;
  phone: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  status: string;
  referralCode: string;
  profile?: {
    id: string;
    nickname?: string;
    avatar?: string;
    upiId?: string;
    bankHolderName?: string;
    bankAccount?: string;
    bankIfsc?: string;
    usdtTrc20?: string;
  };
}

export interface IWallet {
  id: string;
  userId: string;
  mcoinBalance: string;
  lockedBalance: string;
  totalEarned: string;
  totalWithdrawn: string;
  todayEarnings: string;
  todayDate: string;
  version: number;
}

export interface ILedgerTransaction {
  id: string;
  walletId: string;
  userId: string;
  type: string;
  amount: string;
  balanceBefore: string;
  balanceAfter: string;
  referenceType: string;
  referenceId?: string;
  description: string;
  createdAt: string;
}

export interface IOrder {
  id: string;
  orderNumber: string;
  userId: string;
  type: 'INR_BUY' | 'USDT_BUY' | 'SELL_WITHDRAWAL';
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
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  adminNote?: string;
  createdAt: string;
  userPhone?: string;
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
  userSubmission?: {
    id: string;
    status: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
    rewardCredited: string;
    createdAt: string;
  } | null;
}
