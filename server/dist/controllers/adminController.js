import { v4 as uuidv4 } from 'uuid';
import { dbStore } from '../db.js';
import { LedgerService } from '../services/ledger.js';
import { Money } from '../utils/money.js';
export class AdminController {
    static async loginWithPin(req, res) {
        try {
            const { pin } = req.body;
            const state = dbStore.getState();
            const validPin = state.settings['ADMIN_PIN'] || process.env.ADMIN_PIN || 'EarnLoop@Admin#2026';
            if (!pin || pin !== validPin) {
                res.status(401).json({ error: 'Invalid Administrator PIN.' });
                return;
            }
            res.json({
                message: 'Admin authenticated successfully',
                adminPin: validPin
            });
        }
        catch (err) {
            res.status(500).json({ error: err.message || 'Admin login failed' });
        }
    }
    static async getDashboardStats(req, res) {
        try {
            const state = dbStore.getState();
            const totalUsers = state.users.length;
            const totalOrders = state.orders.length;
            const pendingOrders = state.orders.filter(o => o.status === 'UNDER_REVIEW' || o.status === 'PENDING').length;
            const pendingTasks = state.taskSubmissions.filter(s => s.status === 'SUBMITTED' || s.status === 'UNDER_REVIEW').length;
            let totalMcoinIssued = new Money('0.0000');
            let totalCommissionPaid = new Money('0.0000');
            for (const tx of state.ledgerTransactions) {
                if (['DEPOSIT_CREDIT', 'WELCOME_BONUS', 'TASK_REWARD'].includes(tx.type)) {
                    totalMcoinIssued = totalMcoinIssued.add(new Money(tx.amount));
                }
                if (tx.type === 'REFERRAL_COMMISSION') {
                    totalCommissionPaid = totalCommissionPaid.add(new Money(tx.amount));
                }
            }
            res.json({
                metrics: {
                    totalUsers,
                    totalOrders,
                    pendingOrders,
                    pendingTasks,
                    totalMcoinIssued: totalMcoinIssued.toString(),
                    totalCommissionPaid: totalCommissionPaid.toString(),
                },
                recentOrders: state.orders.slice(0, 10),
                recentSubmissions: state.taskSubmissions.slice(0, 10)
            });
        }
        catch (err) {
            res.status(500).json({ error: err.message || 'Failed to fetch admin stats' });
        }
    }
    static async getUsers(req, res) {
        try {
            const state = dbStore.getState();
            const usersData = state.users.map(u => {
                const wallet = LedgerService.getWallet(u.id);
                const profile = state.profiles.find(p => p.userId === u.id);
                const inviteCount = state.users.filter(x => x.referredById === u.id).length;
                return {
                    id: u.id,
                    phone: u.phone,
                    status: u.status,
                    role: u.role,
                    referralCode: u.referralCode,
                    wallet,
                    profile,
                    inviteCount,
                    createdAt: u.createdAt
                };
            });
            res.json({ users: usersData });
        }
        catch (err) {
            res.status(500).json({ error: err.message || 'Failed to fetch users' });
        }
    }
    static async adjustUserBalance(req, res) {
        try {
            const { userId, amount, action, reason } = req.body;
            const state = dbStore.getState();
            const user = state.users.find(u => u.id === userId);
            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            if (!reason || reason.trim().length < 4) {
                res.status(400).json({ error: 'A mandatory ledger reason must be provided.' });
                return;
            }
            const amountMoney = new Money(amount || '0');
            if (!amountMoney.isPositive()) {
                res.status(400).json({ error: 'Adjustment amount must be positive' });
                return;
            }
            let result;
            if (action === 'CREDIT') {
                result = LedgerService.credit({
                    userId,
                    amount: amountMoney.toString(),
                    type: 'ADMIN_ADJUSTMENT',
                    referenceType: 'MANUAL_ADMIN_ADJUSTMENT',
                    description: `Admin manual credit: ${reason}`,
                    adminId: req.adminId || 'admin'
                });
            }
            else {
                result = LedgerService.debit({
                    userId,
                    amount: amountMoney.toString(),
                    type: 'ADMIN_ADJUSTMENT',
                    referenceType: 'MANUAL_ADMIN_ADJUSTMENT',
                    description: `Admin manual debit: ${reason}`,
                    adminId: req.adminId || 'admin'
                });
            }
            // Log to audit log
            const auditLog = {
                id: uuidv4(),
                adminId: req.adminId || 'admin',
                action: action === 'CREDIT' ? 'ADMIN_CREDIT' : 'ADMIN_DEBIT',
                targetType: 'WALLET',
                targetId: userId,
                details: JSON.stringify({ amount: amountMoney.toString(), reason }),
                createdAt: new Date().toISOString()
            };
            state.auditLogs.unshift(auditLog);
            dbStore.save();
            res.json({
                message: `Successfully ${action.toLowerCase()}ed ${amountMoney.toString()} Mcoin.`,
                wallet: result.wallet
            });
        }
        catch (err) {
            res.status(500).json({ error: err.message || 'Balance adjustment failed' });
        }
    }
    static async getOrders(req, res) {
        try {
            const state = dbStore.getState();
            const enrichedOrders = state.orders.map(o => {
                const user = state.users.find(u => u.id === o.userId);
                return {
                    ...o,
                    userPhone: user?.phone || 'Unknown'
                };
            });
            res.json({ orders: enrichedOrders });
        }
        catch (err) {
            res.status(500).json({ error: err.message || 'Failed to fetch orders' });
        }
    }
    static async reviewOrder(req, res) {
        try {
            const { orderId, decision, adminNote } = req.body;
            const state = dbStore.getState();
            const order = state.orders.find(o => o.id === orderId);
            if (!order) {
                res.status(404).json({ error: 'Order not found' });
                return;
            }
            if (['APPROVED', 'REJECTED'].includes(order.status)) {
                res.status(400).json({ error: `Order is already ${order.status.toLowerCase()}` });
                return;
            }
            order.status = decision === 'APPROVE' ? 'APPROVED' : 'REJECTED';
            order.adminNote = adminNote || '';
            order.reviewedAt = new Date().toISOString();
            order.reviewedBy = req.adminId || 'admin';
            if (decision === 'APPROVE') {
                if (order.type === 'INR_BUY' || order.type === 'USDT_BUY') {
                    // 1. Credit purchaser's wallet
                    LedgerService.credit({
                        userId: order.userId,
                        amount: order.totalMcoin,
                        type: 'DEPOSIT_CREDIT',
                        referenceType: 'ORDER',
                        referenceId: order.orderNumber,
                        description: `Order ${order.orderNumber} approved: ${order.totalMcoin} Mcoin credited.`,
                        adminId: req.adminId || 'admin'
                    });
                    // 2. Check Referrer and credit 0.3% commission
                    const purchaser = state.users.find(u => u.id === order.userId);
                    if (purchaser && purchaser.referredById) {
                        const referrer = state.users.find(u => u.id === purchaser.referredById);
                        if (referrer) {
                            const refRate = state.settings['REFERRAL_PERCENT'] || '0.3'; // 0.3%
                            // Commission = fiatAmount * (refRate / 100)
                            const fiatMoney = new Money(order.fiatAmount);
                            // Calculate scaled: 0.3% = 0.003
                            const commissionMoney = fiatMoney.mul('0.003');
                            if (commissionMoney.isPositive()) {
                                LedgerService.credit({
                                    userId: referrer.id,
                                    amount: commissionMoney.toString(),
                                    type: 'REFERRAL_COMMISSION',
                                    referenceType: 'ORDER_REFERRAL',
                                    referenceId: order.orderNumber,
                                    description: `0.3% Team commission from friend (${purchaser.phone.slice(-4)}) order ${order.orderNumber}`,
                                    adminId: req.adminId || 'admin'
                                });
                            }
                        }
                    }
                }
                else if (order.type === 'SELL_WITHDRAWAL') {
                    // Already debited upon submission. Mark approved.
                }
            }
            else {
                // If rejected sell withdrawal, refund the balance back
                if (order.type === 'SELL_WITHDRAWAL') {
                    LedgerService.credit({
                        userId: order.userId,
                        amount: order.totalMcoin,
                        type: 'ADMIN_ADJUSTMENT',
                        referenceType: 'WITHDRAWAL_REFUND',
                        referenceId: order.orderNumber,
                        description: `Refund for rejected withdrawal ${order.orderNumber}: ${adminNote || 'Declined'}`,
                        adminId: req.adminId || 'admin'
                    });
                }
            }
            dbStore.save();
            res.json({ message: `Order successfully ${order.status.toLowerCase()}.`, order });
        }
        catch (err) {
            res.status(500).json({ error: err.message || 'Review failed' });
        }
    }
    static async getTaskSubmissions(req, res) {
        try {
            const state = dbStore.getState();
            const enriched = state.taskSubmissions.map(s => {
                const task = state.tasks.find(t => t.id === s.taskId);
                const user = state.users.find(u => u.id === s.userId);
                return {
                    ...s,
                    taskTitle: task?.title || 'Unknown Task',
                    rewardMcoin: task?.rewardMcoin || '0.0000',
                    userPhone: user?.phone || 'Unknown'
                };
            });
            res.json({ submissions: enriched });
        }
        catch (err) {
            res.status(500).json({ error: err.message || 'Failed to fetch task submissions' });
        }
    }
    static async reviewTaskSubmission(req, res) {
        try {
            const { submissionId, decision, adminFeedback } = req.body;
            const state = dbStore.getState();
            const sub = state.taskSubmissions.find(s => s.id === submissionId);
            if (!sub) {
                res.status(404).json({ error: 'Submission not found' });
                return;
            }
            if (['APPROVED', 'REJECTED'].includes(sub.status)) {
                res.status(400).json({ error: `Submission is already ${sub.status.toLowerCase()}` });
                return;
            }
            const task = state.tasks.find(t => t.id === sub.taskId);
            sub.status = decision === 'APPROVE' ? 'APPROVED' : 'REJECTED';
            sub.adminFeedback = adminFeedback || '';
            sub.reviewedAt = new Date().toISOString();
            sub.reviewedBy = req.adminId || 'admin';
            if (decision === 'APPROVE' && task) {
                sub.rewardCredited = task.rewardMcoin;
                LedgerService.credit({
                    userId: sub.userId,
                    amount: task.rewardMcoin,
                    type: 'TASK_REWARD',
                    referenceType: 'TASK_SUBMISSION',
                    referenceId: sub.id,
                    description: `Reward for completing task: ${task.title}`,
                    adminId: req.adminId || 'admin'
                });
            }
            dbStore.save();
            res.json({ message: `Submission ${sub.status.toLowerCase()}`, submission: sub });
        }
        catch (err) {
            res.status(500).json({ error: err.message || 'Review failed' });
        }
    }
    static async getSettings(req, res) {
        try {
            const state = dbStore.getState();
            res.json({ settings: state.settings });
        }
        catch (err) {
            res.status(500).json({ error: err.message || 'Failed to fetch settings' });
        }
    }
    static async updateSettings(req, res) {
        try {
            const { settings } = req.body;
            const state = dbStore.getState();
            if (settings && typeof settings === 'object') {
                Object.assign(state.settings, settings);
                dbStore.save();
            }
            res.json({ message: 'Settings updated successfully', settings: state.settings });
        }
        catch (err) {
            res.status(500).json({ error: err.message || 'Failed to update settings' });
        }
    }
    static async getAuditLogs(req, res) {
        try {
            const state = dbStore.getState();
            res.json({ logs: state.auditLogs });
        }
        catch (err) {
            res.status(500).json({ error: err.message || 'Failed to fetch logs' });
        }
    }
}
// QR Management Extension for AdminController
export class AdminQrController {
    static async getQrs(req, res) {
        try {
            const state = dbStore.getState();
            res.json({ qrs: state.paymentQrs || [] });
        }
        catch (err) {
            res.status(500).json({ error: err.message || 'Failed to fetch QRs' });
        }
    }
    static async uploadQr(req, res) {
        try {
            const { name, upiId, receiverName, qrImageUrl, isActive } = req.body;
            if (!name || !upiId || !qrImageUrl) {
                res.status(400).json({ error: 'QR Name, UPI ID, and QR Image are required.' });
                return;
            }
            const state = dbStore.getState();
            if (!state.paymentQrs)
                state.paymentQrs = [];
            const newQr = {
                id: uuidv4(),
                name: name.trim(),
                upiId: upiId.trim(),
                receiverName: receiverName ? receiverName.trim() : 'EarnLoop',
                qrImageUrl: qrImageUrl.trim(),
                isActive: isActive !== false,
                createdAt: new Date().toISOString()
            };
            state.paymentQrs.unshift(newQr);
            dbStore.save();
            res.status(201).json({ message: 'QR Code uploaded successfully', qr: newQr });
        }
        catch (err) {
            res.status(500).json({ error: err.message || 'Failed to upload QR' });
        }
    }
    static async toggleQr(req, res) {
        try {
            const { qrId } = req.body;
            const state = dbStore.getState();
            const qr = state.paymentQrs.find(q => q.id === qrId);
            if (!qr) {
                res.status(404).json({ error: 'QR not found' });
                return;
            }
            qr.isActive = !qr.isActive;
            dbStore.save();
            res.json({ message: `QR ${qr.isActive ? 'activated' : 'deactivated'} successfully`, qr });
        }
        catch (err) {
            res.status(500).json({ error: err.message || 'Failed to update QR' });
        }
    }
    static async deleteQr(req, res) {
        try {
            const { id } = req.params;
            const state = dbStore.getState();
            state.paymentQrs = state.paymentQrs.filter(q => q.id !== id);
            dbStore.save();
            res.json({ message: 'QR Code deleted successfully' });
        }
        catch (err) {
            res.status(500).json({ error: err.message || 'Failed to delete QR' });
        }
    }
}
