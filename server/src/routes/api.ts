import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { WalletController } from '../controllers/walletController.js';
import { OrderController } from '../controllers/orderController.js';
import { TaskController } from '../controllers/taskController.js';
import { TeamController } from '../controllers/teamController.js';
import { AdminController, AdminQrController } from '../controllers/adminController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// 1. Auth routes
router.post('/auth/send-otp', AuthController.sendOtp);
router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);
router.post('/auth/forgot-password', AuthController.forgotPassword);
router.get('/auth/me', requireAuth, AuthController.getMe);
router.put('/auth/profile', requireAuth, AuthController.updateProfile);

// 2. Wallet routes
router.get('/wallet', requireAuth, WalletController.getWallet);
router.get('/wallet/transactions', requireAuth, WalletController.getTransactions);
router.get('/wallet/deposit-channels', WalletController.getDepositChannels);

// 3. Orders routes
router.get('/orders/packages', OrderController.getPackages);
router.post('/orders/buy', requireAuth, OrderController.createBuyOrder);
router.post('/orders/submit-proof', requireAuth, OrderController.submitProof);
router.post('/orders/withdraw', requireAuth, OrderController.createWithdrawal);
router.get('/orders/my-orders', requireAuth, OrderController.getMyOrders);

// 4. Tasks & Rewards
router.get('/tasks', TaskController.getTasks);
router.post('/tasks/submit', requireAuth, TaskController.submitTask);
router.get('/tasks/my-submissions', requireAuth, TaskController.getMySubmissions);

// 5. Team & Referral
router.get('/team', requireAuth, TeamController.getTeamData);

// 6. Admin Panel APIs
router.post('/admin/login', AdminController.loginWithPin);
router.get('/admin/stats', requireAdmin, AdminController.getDashboardStats);
router.get('/admin/users', requireAdmin, AdminController.getUsers);
router.post('/admin/users/adjust-balance', requireAdmin, AdminController.adjustUserBalance);
router.get('/admin/orders', requireAdmin, AdminController.getOrders);
router.post('/admin/orders/review', requireAdmin, AdminController.reviewOrder);
router.get('/admin/tasks/submissions', requireAdmin, AdminController.getTaskSubmissions);
router.post('/admin/tasks/review', requireAdmin, AdminController.reviewTaskSubmission);
router.get('/admin/settings', requireAdmin, AdminController.getSettings);
router.put('/admin/settings', requireAdmin, AdminController.updateSettings);
router.get('/admin/audit-logs', requireAdmin, AdminController.getAuditLogs);

// 7. Admin QR Code Manager
router.get('/admin/qrs', requireAdmin, AdminQrController.getQrs);
router.post('/admin/qrs', requireAdmin, AdminQrController.uploadQr);
router.post('/admin/qrs/toggle', requireAdmin, AdminQrController.toggleQr);
router.delete('/admin/qrs/:id', requireAdmin, AdminQrController.deleteQr);

export default router;
