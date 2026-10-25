import { v4 as uuidv4 } from 'uuid';
import { dbStore } from '../db.js';
export class TaskController {
    static async getTasks(req, res) {
        try {
            const state = dbStore.getState();
            const userId = req.user?.id;
            const tasksWithStatus = state.tasks.map(task => {
                let userSubmission = null;
                if (userId) {
                    userSubmission = state.taskSubmissions.find(s => s.taskId === task.id && s.userId === userId);
                }
                return {
                    ...task,
                    userSubmission: userSubmission ? {
                        id: userSubmission.id,
                        status: userSubmission.status,
                        rewardCredited: userSubmission.rewardCredited,
                        createdAt: userSubmission.createdAt
                    } : null
                };
            });
            res.json({ tasks: tasksWithStatus });
        }
        catch (err) {
            res.status(500).json({ error: err.message || 'Failed to fetch tasks' });
        }
    }
    static async submitTask(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const { taskId, proofText, proofImage } = req.body;
            const state = dbStore.getState();
            const task = state.tasks.find(t => t.id === taskId);
            if (!task) {
                res.status(404).json({ error: 'Task not found' });
                return;
            }
            // Duplicate prevention
            const existing = state.taskSubmissions.find(s => s.taskId === taskId && s.userId === req.user.id);
            if (existing) {
                res.status(400).json({ error: 'You have already submitted this task.' });
                return;
            }
            const submission = {
                id: uuidv4(),
                taskId,
                userId: req.user.id,
                proofText: proofText || '',
                proofImage: proofImage || '',
                status: 'SUBMITTED',
                rewardCredited: '0.0000',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            state.taskSubmissions.unshift(submission);
            task.currentSubmissions += 1;
            dbStore.save();
            res.status(201).json({
                message: 'Task submitted for verification! Reward will be credited once approved.',
                submission
            });
        }
        catch (err) {
            res.status(500).json({ error: err.message || 'Failed to submit task' });
        }
    }
    static async getMySubmissions(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const state = dbStore.getState();
            const submissions = state.taskSubmissions
                .filter(s => s.userId === req.user.id)
                .map(s => {
                const task = state.tasks.find(t => t.id === s.taskId);
                return {
                    ...s,
                    taskTitle: task?.title || 'Unknown Task',
                    rewardMcoin: task?.rewardMcoin || '0.0000'
                };
            });
            res.json({ submissions });
        }
        catch (err) {
            res.status(500).json({ error: err.message || 'Failed to fetch submissions' });
        }
    }
}
