import React, { useState, useEffect, useMemo } from 'react';
import { WorkoutSession, Tab, WorkoutTemplate } from './types';
import { WorkoutForm } from './components/WorkoutForm';
import { WorkoutList } from './components/WorkoutList';
import { MarkdownExport } from './components/MarkdownExport';
import { Statistics } from './components/Statistics';
import { TemplateManager } from './components/TemplateManager';
import { WorkoutCalendar } from './components/WorkoutCalendar';
import { ShareImage } from './components/ShareImage';
import { suggestNextWorkout } from './services/geminiService';
import { useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';

const App: React.FC = () => {
  const { user, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>(Tab.HISTORY);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<WorkoutSession | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [templateToLoad, setTemplateToLoad] = useState<WorkoutTemplate | null>(null);
  const [sessionToShare, setSessionToShare] = useState<WorkoutSession | null>(null);

  // ユーザーごとのlocalStorageキーを取得
  const storageKey = useMemo(() => {
    return user ? `ironlog_sessions_${user.id}` : 'ironlog_sessions';
  }, [user]);

  // Load from local storage on mount
  useEffect(() => {
    if (!user) {
      setSessions([]);
      return;
    }
    
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setSessions(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse sessions", e);
      }
    } else {
      setSessions([]);
    }
  }, [user, storageKey]);

  // Save to local storage on change
  useEffect(() => {
    if (!user) return;
    localStorage.setItem(storageKey, JSON.stringify(sessions));
  }, [sessions, user, storageKey]);

  // Suggestion effect (once on load if data exists)
  useEffect(() => {
    if (sessions.length > 0 && !suggestion) {
        // Just a subtle prompt, don't block UI
        const lastSession = sessions[0]; // Assuming descending order
        // Deliberately not calling immediately to save tokens for user action
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Extract unique exercise names for autocomplete
  const existingExerciseNames = useMemo(() => {
    const names = new Set<string>();
    sessions.forEach(session => {
      session.exercises.forEach(ex => {
        if (ex.name) names.add(ex.name);
      });
    });
    return Array.from(names).sort();
  }, [sessions]);

  const handleSaveSession = (session: WorkoutSession) => {
    if (editingSession) {
        // Update existing
        setSessions(prev => prev.map(s => s.id === session.id ? session : s));
    } else {
        // Add new
        setSessions(prev => [session, ...prev]);
    }
    closeForm();
    setActiveTab(Tab.HISTORY);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingSession(null);
    setTemplateToLoad(null);
  }

  const handleSelectTemplate = (template: WorkoutTemplate) => {
    setTemplateToLoad(template);
    setShowTemplates(false);
    setIsFormOpen(true);
  };

  const handleOpenTemplates = () => {
    setShowTemplates(true);
  };

  const handleCalendarDateClick = (date: string) => {
    setEditingSession({
      id: '',
      date,
      exercises: [],
      tags: [],
      notes: ''
    });
    setIsFormOpen(true);
  };

  const handleCalendarSessionClick = (session: WorkoutSession) => {
    setEditingSession(session);
    setIsFormOpen(true);
  };

  const handleDeleteRequest = (id: string) => {
    setSessionToDelete(id);
  };

  const confirmDelete = () => {
    if (sessionToDelete) {
      setSessions(prev => prev.filter(s => s.id !== sessionToDelete));
      setSessionToDelete(null);
    }
  };

  const handleEditSession = (id: string) => {
    const session = sessions.find(s => s.id === id);
    if (session) {
        setEditingSession(session);
        setIsFormOpen(true);
    }
  };

  const getNextWorkoutAdvice = async () => {
     setSuggestion("AIが思考中...");
     const advice = await suggestNextWorkout(sessions[0]);
     setSuggestion(advice);
  };

  // ローディング中または未ログインの場合はログイン画面を表示
  if (loading) {
    return (
      <div className="min-h-screen bg-dark text-slate-200 font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-400">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-dark text-slate-200 font-sans selection:bg-primary/30">
      
      {/* Header */}
      <header className="sticky top-0 z-10 bg-dark/90 backdrop-blur border-b border-slate-800 p-4">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            Muscle diary
          </h1>
          <div className="flex items-center gap-2">
            <button 
              onClick={getNextWorkoutAdvice}
              className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-full border border-slate-700 transition-colors flex items-center gap-1"
            >
              💡 <span className="hidden sm:inline">次のおすすめ</span>
            </button>
            <div className="flex items-center gap-2">
              {user.user_metadata?.avatar_url && (
                <img 
                  src={user.user_metadata.avatar_url} 
                  alt={user.user_metadata?.full_name || user.email || 'User'} 
                  className="w-8 h-8 rounded-full border border-slate-700"
                />
              )}
              <button
                onClick={signOut}
                className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-full border border-slate-700 transition-colors"
                title="ログアウト"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
        
        {suggestion && (
            <div className="max-w-2xl mx-auto mt-2 bg-slate-800/50 p-3 rounded-lg border border-slate-700 text-sm animate-fadeIn relative">
                <button 
                    onClick={() => setSuggestion(null)} 
                    className="absolute top-1 right-2 text-slate-500 hover:text-white"
                >
                    ×
                </button>
                <div className="whitespace-pre-wrap text-slate-300 pr-4">{suggestion}</div>
            </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto p-4 min-h-[calc(100vh-140px)]">
        {showTemplates ? (
          <TemplateManager 
            onSelectTemplate={handleSelectTemplate}
            onClose={() => setShowTemplates(false)}
          />
        ) : isFormOpen ? (
          <div className="animate-slideUp">
            <h2 className="text-xl font-bold mb-4 text-white">
                {editingSession ? 'トレーニング記録の編集' : '新規トレーニング記録'}
            </h2>
            <WorkoutForm 
              onSubmit={handleSaveSession} 
              onCancel={closeForm} 
              historyExerciseNames={existingExerciseNames}
              initialData={editingSession || (templateToLoad ? {
                id: '',
                date: new Date().toISOString().split('T')[0],
                exercises: templateToLoad.exercises,
                tags: templateToLoad.tags,
                notes: templateToLoad.notes || ''
              } : null)}
              onOpenTemplates={handleOpenTemplates}
            />
          </div>
        ) : (
          <>
            {activeTab === Tab.HISTORY && (
              <WorkoutList 
                sessions={sessions} 
                onDelete={handleDeleteRequest} 
                onEdit={handleEditSession}
                onShare={(session) => setSessionToShare(session)}
              />
            )}
            {activeTab === Tab.STATISTICS && (
              <Statistics sessions={sessions} />
            )}
            {activeTab === Tab.CALENDAR && (
              <WorkoutCalendar
                sessions={sessions}
                onDateClick={handleCalendarDateClick}
                onSessionClick={handleCalendarSessionClick}
              />
            )}
            {activeTab === Tab.EXPORT && (
              <MarkdownExport sessions={sessions} />
            )}
          </>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {sessionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={() => setSessionToDelete(null)}>
          <div className="bg-card border border-slate-700 p-6 rounded-xl shadow-2xl max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-2">削除の確認</h3>
            <p className="text-slate-300 mb-6">本当にこのトレーニング記録を削除しますか？</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setSessionToDelete(null)}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
              >
                キャンセル
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors shadow-lg shadow-red-500/20"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Image Modal */}
      {sessionToShare && (
        <ShareImage
          session={sessionToShare}
          onClose={() => setSessionToShare(null)}
        />
      )}

      {/* Floating Action Buttons - Only show when form is closed */}
      {!isFormOpen && !showTemplates && (
        <>
          <button
            onClick={handleOpenTemplates}
            className="fixed right-6 bottom-36 w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg shadow-emerald-500/40 flex items-center justify-center text-xl transition-transform hover:scale-105 active:scale-95 z-20"
            title="テンプレート"
          >
            📋
          </button>
          <button
            onClick={() => setIsFormOpen(true)}
            className="fixed right-6 bottom-24 w-14 h-14 bg-primary hover:bg-blue-600 text-white rounded-full shadow-lg shadow-blue-500/40 flex items-center justify-center text-3xl transition-transform hover:scale-105 active:scale-95 z-20"
            title="新規記録"
          >
            +
          </button>
        </>
      )}

      {/* Bottom Navigation */}
      {!isFormOpen && !showTemplates && (
        <nav className="fixed bottom-0 left-0 right-0 bg-dark/95 backdrop-blur border-t border-slate-800 pb-safe z-10">
          <div className="max-w-2xl mx-auto flex justify-around p-2">
            <button
              onClick={() => setActiveTab(Tab.HISTORY)}
              className={`flex-1 flex flex-col items-center py-2 rounded-lg transition-colors ${
                activeTab === Tab.HISTORY ? 'text-primary' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-medium">履歴</span>
            </button>
            
            <button
              onClick={() => setActiveTab(Tab.STATISTICS)}
              className={`flex-1 flex flex-col items-center py-2 rounded-lg transition-colors ${
                activeTab === Tab.STATISTICS ? 'text-primary' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-xs font-medium">統計</span>
            </button>
            
            <button
              onClick={() => setActiveTab(Tab.CALENDAR)}
              className={`flex-1 flex flex-col items-center py-2 rounded-lg transition-colors ${
                activeTab === Tab.CALENDAR ? 'text-primary' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs font-medium">カレンダー</span>
            </button>
            
            <button
              onClick={() => setActiveTab(Tab.EXPORT)}
              className={`flex-1 flex flex-col items-center py-2 rounded-lg transition-colors ${
                activeTab === Tab.EXPORT ? 'text-primary' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
              <span className="text-xs font-medium">Markdown出力</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
};

export default App;