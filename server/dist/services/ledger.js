import { dbStore } from '../db.js';
import { Money } from '../utils/money.js';
import { v4 as uuidv4 } from 'uuid';
export class LedgerService {
    static getWallet(userId) {
        const state = dbStore.getState();
        let wallet = state.wallets.find(w => w.userId === userId);
        const todayStr = new Date().toISOString().split('T')[0];
        if (!wallet) {
            wallet = {
                id: uuidv4(),
                userId,
                mcoinBalance: '0.0000',
                lockedBalance: '0.0000',
                totalEarned: '0.0000',
                totalWithdrawn: '0.0000',
                todayEarnings: '0.0000',
                todayDate: todayStr,
                version: 1
            };
            state.wallets.push(wallet);
            dbStore.save();
        }
        else if (wallet.todayDate !== todayStr) {
            // New day reset for today's earnings
            wallet.todayEarnings = '0.0000';
            wallet.todayDate = todayStr;
            dbStore.save();
        }
        return wallet;
    }
    static credit(params) {
        const state = dbStore.getState();
        const wallet = this.getWallet(params.userId);
        const amountMoney = new Money(params.amount);
        if (!amountMoney.isPositive()) {
            throw new Error('Credit amount must be positive');
        }
        const currentBalance = new Money(wallet.mcoinBalance);
        const newBalance = currentBalance.add(amountMoney);
        const totalEarned = new Money(wallet.totalEarned).add(amountMoney);
        const todayEarnings = new Money(wallet.todayEarnings).add(amountMoney);
        const transaction = {
            id: uuidv4(),
            walletId: wallet.id,
            userId: params.userId,
            type: params.type,
            amount: amountMoney.toString(),
            balanceBefore: currentBalance.toString(),
            balanceAfter: newBalance.toString(),
            referenceType: params.referenceType,
            referenceId: params.referenceId,
            description: params.description,
            adminId: params.adminId,
            createdAt: new Date().toISOString()
        };
        wallet.mcoinBalance = newBalance.toString();
        wallet.totalEarned = totalEarned.toString();
        wallet.todayEarnings = todayEarnings.toString();
        wallet.version += 1;
        state.ledgerTransactions.unshift(transaction);
        dbStore.save();
        return { wallet, transaction };
    }
    static debit(params) {
        const state = dbStore.getState();
        const wallet = this.getWallet(params.userId);
        const amountMoney = new Money(params.amount);
        if (!amountMoney.isPositive()) {
            throw new Error('Debit amount must be positive');
        }
        const currentBalance = new Money(wallet.mcoinBalance);
        if (currentBalance.lt(amountMoney)) {
            throw new Error('Insufficient Mcoin balance');
        }
        const newBalance = currentBalance.sub(amountMoney);
        const totalWithdrawn = new Money(wallet.totalWithdrawn).add(amountMoney);
        const transaction = {
            id: uuidv4(),
            walletId: wallet.id,
            userId: params.userId,
            type: params.type,
            amount: amountMoney.toString(),
            balanceBefore: currentBalance.toString(),
            balanceAfter: newBalance.toString(),
            referenceType: params.referenceType,
            referenceId: params.referenceId,
            description: params.description,
            adminId: params.adminId,
            createdAt: new Date().toISOString()
        };
        wallet.mcoinBalance = newBalance.toString();
        wallet.totalWithdrawn = totalWithdrawn.toString();
        wallet.version += 1;
        state.ledgerTransactions.unshift(transaction);
        dbStore.save();
        return { wallet, transaction };
    }
}
