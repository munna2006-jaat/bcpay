import React, { useState, useEffect } from 'react';
import { ArrowLeft, Gift, CheckCircle, Clock, ExternalLink, Send } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ITask } from '../types';

interface TasksPageProps {
  onBack: () => void;
}

export const TasksPage: React.FC<TasksPageProps> = ({ onBack }) => {
  const { user, showToast, setShowAuthModal, refreshUser } = useAuth();
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [activeTask, setActiveTask] = useState<ITask | null>(null);
  const [proofText, setProofText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const res = await api.getTasks();
      setTasks(res.tasks);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (!activeTask) return;

    if (!proofText || proofText.trim().length < 3) {
      showToast('Please enter proof details (e.g. username or confirmation)', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.submitTask({
        taskId: activeTask.id,
        proofText: proofText.trim(),
      });
      showToast('Task submitted for review! Mcoin will be credited upon verification.', 'success');
      setActiveTask(null);
      setProofText('');
      await fetchTasks();
      await refreshUser();
    } catch (err: any) {
      showToast(err.message || 'Submission failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      {/* Top Header */}
      <div className="flex items-center gap-3 py-1 border-b border-gray-100">
        <button
          onClick={onBack}
          className="p-1.5 rounded-full hover:bg-gray-100 text-gray-700 active:scale-95 transition"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-base font-bold text-gray-900">Welcome Rewards & Tasks</h1>
      </div>

      {/* Hero Welcome Card */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-2xl p-4 text-white shadow-md space-y-1">
        <div className="flex items-center gap-2">
          <Gift size={22} className="animate-bounce" />
          <h2 className="text-base font-black">Earn Up To 200 Mcoin</h2>
        </div>
        <p className="text-xs text-white/90">
          Complete simple daily missions and social tasks to claim your instant Mcoin rewards.
        </p>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {tasks.map((task) => {
          const isSubmitted = !!task.userSubmission;
          const isApproved = task.userSubmission?.status === 'APPROVED';

          return (
            <div
              key={task.id}
              className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0088FF] bg-blue-50 px-2 py-0.5 rounded-md">
                    {task.category}
                  </span>
                  <h3 className="text-sm font-bold text-gray-900 mt-1">{task.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{task.instructions}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm font-black text-orange-600 block">
                    +{Number(task.rewardMcoin).toFixed(0)}
                  </span>
                  <span className="text-[10px] text-gray-400">Mcoin</span>
                </div>
              </div>

              {/* Action row */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                {task.link && task.link !== '#' ? (
                  <a
                    href={task.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#0088FF] font-semibold flex items-center gap-1 hover:underline"
                  >
                    <span>Open Link</span>
                    <ExternalLink size={12} />
                  </a>
                ) : (
                  <span className="text-xs text-gray-400">In-App Mission</span>
                )}

                {isApproved ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                    <CheckCircle size={14} /> Completed
                  </span>
                ) : isSubmitted ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                    <Clock size={14} /> Under Review
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      if (!user) {
                        setShowAuthModal(true);
                        return;
                      }
                      setActiveTask(task);
                    }}
                    className="px-4 py-1.5 rounded-full bg-[#0088FF] text-white font-bold text-xs shadow-sm hover:bg-[#0077E6] active:scale-95 transition"
                  >
                    Submit Proof
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Proof Submission Modal */}
      {activeTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-4 text-sm">
            <h3 className="font-bold text-gray-900 text-base">Submit Proof: {activeTask.title}</h3>
            <p className="text-xs text-gray-600">{activeTask.requirements}</p>

            <form onSubmit={handleSubmitProof} className="space-y-3">
              <textarea
                placeholder="Enter your username, reference, or proof details..."
                value={proofText}
                onChange={(e) => setProofText(e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0088FF]"
                required
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTask(null)}
                  className="flex-1 py-2 bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 bg-[#0088FF] text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
