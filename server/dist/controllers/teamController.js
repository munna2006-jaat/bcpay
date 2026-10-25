import { dbStore } from '../db.js';
import { Money } from '../utils/money.js';
export class TeamController {
    static async getTeamData(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const state = dbStore.getState();
            const todayStr = new Date().toISOString().split('T')[0];
            // 1. Invites
            const invitedUsers = state.users.filter(u => u.referredById === req.user.id);
            const totalInvites = invitedUsers.length;
            const todayInvites = invitedUsers.filter(u => u.createdAt.startsWith(todayStr)).length;
            // 2. Commissions from Ledger
            const refTransactions = state.ledgerTransactions.filter(t => t.userId === req.user.id && t.type === 'REFERRAL_COMMISSION');
            let totalCommissionMoney = new Money('0.0000');
            let todayCommissionMoney = new Money('0.0000');
            for (const tx of refTransactions) {
                const txAmount = new Money(tx.amount);
                totalCommissionMoney = totalCommissionMoney.add(txAmount);
                if (tx.createdAt.startsWith(todayStr)) {
                    todayCommissionMoney = todayCommissionMoney.add(txAmount);
                }
            }
            const host = req.get('host') || 'earnloop.onrender.com';
            const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
            const invitationLink = `${protocol}://${host}/#/register?ref=${req.user.referralCode}`;
            // Masked friend list
            const invitationHistory = invitedUsers.map(u => ({
                id: u.id,
                phoneMasked: `${u.phone.slice(0, 3)}****${u.phone.slice(-3)}`,
                joinedAt: u.createdAt,
                status: u.status
            })).sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime());
            res.json({
                totalCommission: totalCommissionMoney.toString(),
                todayCommission: todayCommissionMoney.toString(),
                totalInvites,
                todayInvites,
                invitationCode: req.user.referralCode,
                invitationLink,
                invitationHistory
            });
        }
        catch (err) {
            res.status(500).json({ error: err.message || 'Failed to fetch team data' });
        }
    }
}
