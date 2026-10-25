import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { dbStore } from '../db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { Money } from '../utils/money.js';
import { LedgerService } from '../services/ledger.js';
import { IOrder, OrderType } from '../types.js';

export const INR_PACKAGES = {
  Small: [
    { amount: '300.0000', reward: '15.0000', formula: '3%+6', total: '315.0000' },
    { amount: '641.0000', reward: '25.2300', formula: '3%+6', total: '666.2300' },
    { amount: '1200.0000', reward: '42.0000', formula: '3%+6', total: '1242.0000' },
    { amount: '2500.0000', reward: '81.0000', formula: '3%+6', total: '2581.0000' },
  ],
  Middle: [
    { amount: '5000.0000', reward: '210.0000', formula: '4%+10', total: '5210.0000' },
    { amount: '10000.0000', reward: '450.0000', formula: '4%+50', total: '10450.0000' },
    { amount: '25000.0000', reward: '1250.0000', formula: '5%', total: '26250.0000' },
  ],
  Large: [
    { amount: '50000.0000', reward: '3000.0000', formula: '6%', total: '53000.0000' },
    { amount: '100000.0000', reward: '7000.0000', formula: '7%', total: '107000.0000' },
    { amount: '200000.0000', reward: '16000.0000', formula: '8%', total: '216000.0000' },
  ]
};

export class OrderController {
  public static async getPackages(req: AuthenticatedRequest, res: Response): Promise<void> {
    const state = dbStore.getState();
    res.json({
      inrPackages: INR_PACKAGES,
      usdtRatio: state.settings['USDT_TO_MCOIN_RATE'] || '110.5',
      inrRatio: state.settings['INR_TO_MCOIN_RATE'] || '1.0'
    });
  }

  public static async createBuyOrder(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { type, fiatAmount, network, tier } = req.body;
      const state = dbStore.getState();

      if (!type || !['INR_BUY', 'USDT_BUY'].includes(type)) {
        res.status(400).json({ error: 'Invalid order type' });
        return;
      }

      const amountMoney = new Money(fiatAmount || '0');
      if (!amountMoney.isPositive()) {
        res.status(400).json({ error: 'Order amount must be positive' });
        return;
      }

      let rateApplied = '1.0';
      let rewardMcoin = '0.0000';
      let totalMcoin = '0.0000';
      let depositAddress = '';

      if (type === 'INR_BUY') {
        rateApplied = state.settings['INR_TO_MCOIN_RATE'] || '1.0';
        depositAddress = state.settings['ADMIN_UPI_ID'] || 'paytm.earnloop@okaxis';

        // Find package reward if matches standard tier
        let match = null;
        for (const cat of ['Small', 'Middle', 'Large'] as const) {
          match = INR_PACKAGES[cat].find(p => new Money(p.amount).eq(amountMoney));
          if (match) break;
        }

        if (match) {
          rewardMcoin = match.reward;
          totalMcoin = match.total;
        } else {
          // Standard rate
          totalMcoin = amountMoney.toString();
        }
      } else {
        // USDT
        rateApplied = state.settings['USDT_TO_MCOIN_RATE'] || '110.5';
        depositAddress = state.settings['ADMIN_USDT_TRC20'] || 'TQn9Y2khEsLJW1ChVWFMSMeSTow5KaxUSDT';
        const converted = amountMoney.mul(rateApplied);
        totalMcoin = converted.toString();
      }

      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randSuffix = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `ORD-${dateStr}-${randSuffix}`;

      const order: IOrder = {
        id: uuidv4(),
        orderNumber,
        userId: req.user.id,
        type: type as OrderType,
        tier: tier || 'Custom',
        fiatAmount: amountMoney.toString(),
        currency: type === 'INR_BUY' ? 'INR' : 'USDT',
        rateApplied,
        rewardMcoin,
        totalMcoin,
        network: network || (type === 'INR_BUY' ? 'UPI' : 'TRC20'),
        depositAddress,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      state.orders.unshift(order);
      dbStore.save();

      res.status(201).json({
        message: 'Order created successfully. Please submit payment details.',
        order
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to create order' });
    }
  }

  public static async submitProof(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { orderId, utrNumber, proofImage } = req.body;
      const state = dbStore.getState();
      const order = state.orders.find(o => o.id === orderId && o.userId === req.user!.id);

      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }

      if (order.status !== 'PENDING') {
        res.status(400).json({ error: `Order is already ${order.status.toLowerCase()}` });
        return;
      }

      if (!utrNumber || utrNumber.trim().length < 6) {
        res.status(400).json({ error: 'Please enter a valid Transaction ID / UTR number.' });
        return;
      }

      order.utrNumber = utrNumber.trim();
      if (proofImage) order.proofImage = proofImage;
      order.status = 'UNDER_REVIEW';
      order.updatedAt = new Date().toISOString();

      dbStore.save();

      res.json({
        message: 'Payment proof submitted! Order is under review.',
        order
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to submit proof' });
    }
  }

  public static async createWithdrawal(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { mcoinAmount, destinationType, destinationValue } = req.body;
      const amountMoney = new Money(mcoinAmount || '0');

      if (!amountMoney.isPositive() || amountMoney.lt('100.0000')) {
        res.status(400).json({ error: 'Minimum withdrawal is 100 Mcoin.' });
        return;
      }

      const state = dbStore.getState();
      const wallet = LedgerService.getWallet(req.user.id);
      const balance = new Money(wallet.mcoinBalance);

      if (balance.lt(amountMoney)) {
        res.status(400).json({ error: 'Insufficient Mcoin balance for withdrawal.' });
        return;
      }

      // Debit wallet immediately
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randSuffix = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `WTH-${dateStr}-${randSuffix}`;

      LedgerService.debit({
        userId: req.user.id,
        amount: amountMoney.toString(),
        type: 'WITHDRAWAL_DEBIT',
        referenceType: 'WITHDRAWAL_REQUEST',
        referenceId: orderNumber,
        description: `Sell Withdrawal via ${destinationType || 'UPI'}: ${destinationValue}`
      });

      const order: IOrder = {
        id: uuidv4(),
        orderNumber,
        userId: req.user.id,
        type: 'SELL_WITHDRAWAL',
        fiatAmount: amountMoney.toString(),
        currency: 'INR',
        rateApplied: '1.0',
        rewardMcoin: '0.0000',
        totalMcoin: amountMoney.toString(),
        network: destinationType || 'UPI',
        depositAddress: destinationValue,
        status: 'UNDER_REVIEW',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      state.orders.unshift(order);
      dbStore.save();

      res.status(201).json({
        message: 'Withdrawal request submitted successfully.',
        order
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to submit withdrawal' });
    }
  }

  public static async getMyOrders(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const state = dbStore.getState();
      const orders = state.orders
        .filter(o => o.userId === req.user!.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      res.json({ orders });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch orders' });
    }
  }
}
