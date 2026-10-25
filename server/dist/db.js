import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');
const defaultState = {
    users: [],
    profiles: [],
    wallets: [],
    ledgerTransactions: [],
    orders: [],
    tasks: [
        {
            id: 'task-1',
            title: 'Join Official Telegram Community',
            category: 'Social',
            rewardMcoin: '20.0000',
            icon: 'send',
            instructions: 'Join our official VIP Telegram channel and stay updated on daily Mcoin drops.',
            requirements: 'Submit your Telegram @username and a screenshot of the channel membership.',
            link: 'https://t.me/earnloop_official',
            status: 'AVAILABLE',
            maxSubmissions: 5000,
            currentSubmissions: 142
        },
        {
            id: 'task-2',
            title: 'Follow Official Twitter/X & Repost',
            category: 'Social',
            rewardMcoin: '15.0000',
            icon: 'twitter',
            instructions: 'Follow @EarnLoopFin on X and repost the pinned announcement.',
            requirements: 'Submit your X profile link.',
            link: 'https://x.com/earnloopfin',
            status: 'AVAILABLE',
            maxSubmissions: 3000,
            currentSubmissions: 89
        },
        {
            id: 'task-3',
            title: 'Complete First Purchase Tutorial',
            category: 'App',
            rewardMcoin: '30.0000',
            icon: 'check-circle',
            instructions: 'Watch the video tutorial on buying Mcoin with INR UPI or USDT and complete your first order.',
            requirements: 'Submit completed order number.',
            link: '#',
            status: 'AVAILABLE',
            maxSubmissions: 10000,
            currentSubmissions: 512
        }
    ],
    taskSubmissions: [],
    settings: {
        INR_TO_MCOIN_RATE: '1.0',
        USDT_TO_MCOIN_RATE: '110.5',
        ADMIN_UPI_ID: 'paytm.earnloop@okaxis',
        ADMIN_UPI_NAME: 'EarnLoop Technologies',
        ADMIN_USDT_TRC20: 'TQn9Y2khEsLJW1ChVWFMSMeSTow5KaxUSDT',
        ADMIN_PIN: 'EarnLoop@Admin#2026',
        SMS_MOCK_MODE: 'true',
        WELCOME_BONUS_MCOIN: '20.0000',
        REFERRAL_PERCENT: '0.3',
        SUPPORT_WHATSAPP: 'https://wa.me/918619142008',
        SUPPORT_TELEGRAM: 'https://t.me/earnloop_official',
        SUPPORT_EMAIL: 'support@earnloopfin.com'
    },
    auditLogs: [],
    otps: []
};
class MemoryStore {
    data;
    constructor() {
        this.data = this.load();
    }
    load() {
        try {
            if (!fs.existsSync(DATA_DIR)) {
                fs.mkdirSync(DATA_DIR, { recursive: true });
            }
            if (fs.existsSync(STORE_FILE)) {
                const raw = fs.readFileSync(STORE_FILE, 'utf-8');
                return JSON.parse(raw);
            }
        }
        catch (err) {
            console.warn('Could not read existing store.json, using defaults:', err);
        }
        this.save(defaultState);
        return JSON.parse(JSON.stringify(defaultState));
    }
    save(state) {
        try {
            if (state)
                this.data = state;
            if (!fs.existsSync(DATA_DIR)) {
                fs.mkdirSync(DATA_DIR, { recursive: true });
            }
            fs.writeFileSync(STORE_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
        }
        catch (err) {
            console.error('Failed to save store.json:', err);
        }
    }
    getState() {
        return this.data;
    }
}
export const dbStore = new MemoryStore();
