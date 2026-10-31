import React, { useState, useEffect } from 'react';
import {
  X,
  History,
  Trash2,
  ExternalLink,
  FolderOpen,
  Calendar,
  Layers,
  ArrowRight,
  Database,
  User,
  LogIn,
} from 'lucide-react';
import { fetchSavedSessions, deleteSavedSession } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function SavedSessionsDrawer({
  isOpen,
  onClose,
  onLoadSession,
  onOpenAuthModal,
}) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [storageType, setStorageType] = useState('supabase');

  const loadSessionsList = async () => {
    if (!user) {
      setSessions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetchSavedSessions(user.id);
      setSessions(res.sessions || []);
      setStorageType(res.storage || 'localStorage');
    } catch (err) {
      console.warn('[SavedSessionsDrawer] Error loading sessions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch sessions whenever isOpen opens or when the logged-in user changes
  useEffect(() => {
    if (isOpen) {
      if (user) {
        loadSessionsList();
      } else {
        setSessions([]);
        setIsLoading(false);
      }
    }
  }, [isOpen, user]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDelete = async (e, sessionId) => {
    e.stopPropagation();
    if (window.confirm('Delete this saved research session?')) {
      await deleteSavedSession(sessionId, user?.id);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden no-print">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md transform border-l border-zinc-200/80 bg-white shadow-2xl transition-all dark:border-zinc-800 dark:bg-zinc-900 flex flex-col">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
            <div className="flex items-center space-x-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
                <History className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                  Saved Research Analyses
                </h3>
                <div className="flex items-center space-x-1.5 text-[11px] text-zinc-400">
                  <Database className="h-3 w-3" />
                  <span>
                    Storage: {storageType === 'supabase' ? 'Supabase Table' : 'Local Storage'}
                    {user ? ` • ${user.email?.split('@')[0]}` : ''}
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* List Body */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
            {!user ? (
              <div className="py-16 text-center space-y-4 px-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  <User className="h-7 w-7" />
                </div>
                <div className="space-y-1.5 max-w-xs mx-auto">
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                    Sign in to View Saved Analyses
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Sign in with your email to view and manage your saved research analyses.
                  </p>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onOpenAuthModal) onOpenAuthModal();
                    }}
                    className="inline-flex items-center space-x-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 transition-colors shadow-soft"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Sign In</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {isLoading && (
                  <div className="py-12 text-center text-xs text-zinc-400">
                    Loading saved sessions...
                  </div>
                )}

                {!isLoading && sessions.length === 0 && (
                  <div className="py-12 text-center text-xs text-zinc-400 space-y-2">
                    <FolderOpen className="mx-auto h-8 w-8 text-zinc-300 dark:text-zinc-700" />
                    <p>No saved analyses found for this account.</p>
                    <p className="text-[11px] text-zinc-500">
                      Run an audit in Step 2 to automatically save your sessions.
                    </p>
                  </div>
                )}

                {!isLoading &&
                  sessions.map((session) => {
                    const analysis = session.analysis_result || session.analysisResult;
                    const score = analysis?.readinessScore;
                    const sourceCount = (session.sources || []).length;
                    const dateFormatted = session.created_at
                      ? new Date(session.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Recent';

                    return (
                      <div
                        key={session.id}
                        onClick={() => {
                          onLoadSession(session);
                          onClose();
                        }}
                        className="group cursor-pointer rounded-2xl border border-zinc-200/80 bg-zinc-50/60 p-4 transition-all hover:border-zinc-300 hover:bg-white dark:border-zinc-800 dark:bg-zinc-850/50 dark:hover:border-zinc-700 dark:hover:bg-zinc-850 space-y-2 shadow-soft"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-600 dark:text-zinc-400">
                            {session.category || 'General'}
                          </span>
                          {score !== undefined && (
                            <span className="font-mono text-xs font-bold text-zinc-900 dark:text-white">
                              {score}/100
                            </span>
                          )}
                        </div>

                        <h4 className="text-xs font-bold text-zinc-900 dark:text-white line-clamp-2 leading-snug">
                          {session.topic}
                        </h4>

                        <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1 border-t border-zinc-200/50 dark:border-zinc-800">
                          <span>{dateFormatted} &bull; {sourceCount} sources</span>
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={(e) => handleDelete(e, session.id)}
                              className="p-1 text-zinc-400 hover:text-rose-600"
                              title="Delete session"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                            <span className="font-semibold text-zinc-900 dark:text-white flex items-center space-x-0.5 group-hover:translate-x-0.5 transition-transform">
                              <span>Open</span>
                              <ArrowRight className="h-3 w-3" />
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-zinc-100 bg-zinc-50 px-6 py-3.5 dark:border-zinc-800 dark:bg-zinc-950 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 shadow-soft"
            >
              Close
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
