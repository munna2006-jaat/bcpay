import { dbStore } from '../db.js';
import { LedgerService } from '../services/ledger.js';
export class WalletController {
    static async getWallet(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const wallet = LedgerService.getWallet(req.user.id);
            res.json({ wallet });
        }
        catch (err) {
            res.status(500).json({ error: err.message || 'Failed to fetch wallet' });
        }
    }
    static async getTransactions(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const state = dbStore.getState();
            const transactions = state.ledgerTransactions
                .filter(t => t.userId === req.user.id)
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            res.json({ transactions });
        }
        catch (err) {
            res.status(500).json({ error: err.message || 'Failed to fetch transactions' });
        }
    }
    static async getDepositChannels(req, res) {
        try {
            const state = dbStore.getState();
            const activeQrs = (state.paymentQrs || []).filter(q => q.isActive);
            res.json({
                rates: {
                    inrToMcoin: state.settings['INR_TO_MCOIN_RATE'] || '1.0',
                    usdtToMcoin: state.settings['USDT_TO_MCOIN_RATE'] || '110.5',
                },
                upi: {
                    upiId: state.settings['ADMIN_UPI_ID'] || 'paytm.earnloop@okaxis',
                    name: state.settings['ADMIN_UPI_NAME'] || 'EarnLoop Technologies',
                },
                activeQrs,
                usdt: {
                    trc20Address: state.settings['ADMIN_USDT_TRC20'] || 'TQn9Y2khEsLJW1ChVWFMSMeSTow5KaxUSDT',
                    networks: ['TRC20 (Tron)', 'ERC20 (Ethereum)', 'BEP20 (BNB Smart Chain)'],
                }
            });
        }
        catch (err) {
            res.status(500).json({ error: err.message || 'Failed to fetch channels' });
        }
    }
}
