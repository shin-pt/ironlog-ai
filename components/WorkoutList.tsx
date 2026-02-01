import React, { useState, useMemo } from 'react';
import { WorkoutSession, MUSCLE_GROUPS } from '../types';

interface WorkoutListProps {
  sessions: WorkoutSession[];
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onShare?: (session: WorkoutSession) => void;
}

export const WorkoutList: React.FC<WorkoutListProps> = ({ sessions, onDelete, onEdit, onShare }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());

  // フィルタリングされたセッション
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      // 検索クエリでフィルタ（種目名、メモ）
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesExercise = session.exercises.some(ex => 
          ex.name.toLowerCase().includes(query)
        );
        const matchesNotes = session.notes.toLowerCase().includes(query);
        if (!matchesExercise && !matchesNotes) return false;
      }

      // タグでフィルタ
      if (selectedTags.length > 0) {
        const hasSelectedTag = selectedTags.some(tag => session.tags.includes(tag));
        if (!hasSelectedTag) return false;
      }

      // 日付範囲でフィルタ
      if (dateFrom && session.date < dateFrom) return false;
      if (dateTo && session.date > dateTo) return false;

      return true;
    });
  }, [sessions, searchQuery, selectedTags, dateFrom, dateTo]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
    setDateFrom('');
    setDateTo('');
  };

  const toggleSession = (sessionId: string) => {
    setExpandedSessions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  };

  const hasActiveFilters = searchQuery.trim() !== '' || selectedTags.length > 0 || dateFrom !== '' || dateTo !== '';

  // 全てのユニークな種目名を取得（検索候補用）
  const allExerciseNames = useMemo(() => {
    const names = new Set<string>();
    sessions.forEach(session => {
      session.exercises.forEach(ex => {
        if (ex.name.trim()) names.add(ex.name);
      });
    });
    return Array.from(names).sort();
  }, [sessions]);

  if (sessions.length === 0) {
    return (
      <div className="text-center py-20 text-slate-500">
        <div className="text-6xl mb-4">🏋️</div>
        <p>まだ記録がありません。</p>
        <p className="text-sm mt-2">「記録」タブから最初のトレーニングを追加しましょう！</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {/* 検索・フィルタバー */}
      <div className="bg-card p-4 rounded-xl border border-slate-700 space-y-3">
        {/* 検索バー */}
        <div className="relative">
          <input
            type="text"
            placeholder="種目名やメモで検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-dark text-white p-3 pl-10 rounded-lg border border-slate-600 focus:border-primary outline-none"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* フィルタトグルボタン */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-sm text-slate-400 hover:text-white flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {showFilters ? 'フィルタを隠す' : 'フィルタを表示'}
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-red-400 hover:text-red-300"
            >
              フィルタをクリア
            </button>
          )}
        </div>

        {/* フィルタパネル */}
        {showFilters && (
          <div className="space-y-3 pt-2 border-t border-slate-700">
            {/* タグフィルタ */}
            <div>
              <label className="block text-xs text-slate-400 mb-2">部位でフィルタ</label>
              <div className="flex flex-wrap gap-2">
                {MUSCLE_GROUPS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-primary text-white'
                        : 'bg-dark text-slate-400 border border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* 日付範囲フィルタ */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-slate-400 mb-1">開始日</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full bg-dark text-white p-2 rounded-lg border border-slate-600 focus:border-primary outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">終了日</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full bg-dark text-white p-2 rounded-lg border border-slate-600 focus:border-primary outline-none text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* 検索候補（種目名） */}
        {searchQuery.trim() && allExerciseNames.some(name => name.toLowerCase().includes(searchQuery.toLowerCase())) && (
          <div className="pt-2 border-t border-slate-700">
            <div className="text-xs text-slate-400 mb-2">検索候補:</div>
            <div className="flex flex-wrap gap-2">
              {allExerciseNames
                .filter(name => name.toLowerCase().includes(searchQuery.toLowerCase()))
                .slice(0, 5)
                .map(name => (
                  <button
                    key={name}
                    onClick={() => setSearchQuery(name)}
                    className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-600 hover:border-primary"
                  >
                    {name}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* 結果数表示 */}
      {hasActiveFilters && (
        <div className="text-sm text-slate-400">
          {filteredSessions.length}件の結果が見つかりました（全{sessions.length}件中）
        </div>
      )}

      {/* フィルタ結果が空の場合 */}
      {filteredSessions.length === 0 && hasActiveFilters ? (
        <div className="text-center py-20 text-slate-500">
          <div className="text-6xl mb-4">🔍</div>
          <p>該当する記録が見つかりませんでした。</p>
          <button
            onClick={clearFilters}
            className="mt-4 text-sm text-primary hover:text-blue-400"
          >
            フィルタをクリア
          </button>
        </div>
      ) : (
        filteredSessions.map((session) => {
          const isExpanded = expandedSessions.has(session.id);
          
          return (
            <div key={session.id} className="bg-card rounded-xl border border-slate-700 overflow-hidden hover:border-slate-500 transition-colors shadow-sm">
              {/* ヘッダー部分（常に表示、クリック可能） */}
              <div 
                className="p-4 flex justify-between items-center bg-slate-800/30 cursor-pointer hover:bg-slate-800/50 transition-colors"
                onClick={() => toggleSession(session.id)}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex flex-col gap-1 flex-1">
                    <span className="text-lg text-white font-mono font-bold">{session.date}</span>
                    {session.duration && (
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <span>⏱️</span>
                        {session.duration}分
                      </span>
                    )}
                  </div>
                  {/* 折りたたみアイコン */}
                  <div className="text-slate-400">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <div className="flex gap-2 relative z-10" onClick={(e) => e.stopPropagation()}>
                  {onShare && (
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onShare(session);
                      }}
                      className="text-slate-400 hover:text-emerald-400 w-10 h-10 flex items-center justify-center hover:bg-emerald-400/10 rounded-full transition-colors"
                      title="シェア"
                    >
                      <span className="text-lg">📤</span>
                    </button>
                  )}
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(session.id);
                    }}
                    className="text-slate-400 hover:text-blue-400 w-10 h-10 flex items-center justify-center hover:bg-blue-400/10 rounded-full transition-colors"
                    title="編集"
                  >
                    <span className="text-lg">✏️</span>
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(session.id);
                    }}
                    className="text-slate-400 hover:text-red-400 w-10 h-10 flex items-center justify-center hover:bg-red-400/10 rounded-full transition-colors"
                    title="削除"
                  >
                    <span className="text-lg">🗑️</span>
                  </button>
                </div>
              </div>
              
              {/* 詳細部分（展開時のみ表示） */}
              {isExpanded && (
                <div className="p-4 space-y-4 border-t border-slate-700/50">
                  {/* Tags */}
                  {session.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {session.tags.map(tag => (
                        <span key={tag} className="text-xs bg-slate-700 text-slate-200 px-2.5 py-1 rounded-full border border-slate-600 font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* 有酸素運動の詳細 */}
                  {session.tags.includes('有酸素 (Cardio)') && (session.cardioDuration || session.cardioDistance) && (
                    <div className="mb-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                      <div className="text-xs text-slate-300 font-medium mb-2">🏃 有酸素運動の詳細</div>
                      <div className="flex flex-wrap gap-4 text-xs mb-2">
                        {session.cardioDuration && (
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400">時間:</span>
                            <span className="text-emerald-400 font-bold">{session.cardioDuration}分</span>
                          </div>
                        )}
                        {session.cardioDistance && (
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400">距離:</span>
                            <span className="text-emerald-400 font-bold">{session.cardioDistance}km</span>
                          </div>
                        )}
                      </div>
                      {/* 速度の自動計算表示 */}
                      {session.cardioDuration && session.cardioDuration > 0 && session.cardioDistance && session.cardioDistance > 0 && (
                        <div className="pt-2 border-t border-slate-700/50">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400">平均速度</span>
                            <span className="text-sm font-bold text-emerald-400 font-mono">
                              {(session.cardioDistance / (session.cardioDuration / 60)).toFixed(2)} km/h
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 種目リスト */}
                  {session.exercises.map((ex) => (
                    <div key={ex.id} className="border-b border-slate-700/30 last:border-0 pb-3 last:pb-0">
                      <div className="flex justify-between items-baseline mb-2">
                        <span className="text-slate-200 font-bold text-sm">{ex.name}</span>
                        <span className="text-xs text-slate-500 font-mono">
                          {ex.sets.length} sets
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {ex.sets.map((set, i) => (
                          <div key={set.id} className="text-xs bg-slate-900/50 text-slate-300 px-2 py-1 rounded border border-slate-700/50 flex items-center">
                            <span className="text-slate-500 mr-1.5 font-mono">{i + 1}</span>
                            <span className="font-medium">
                              {set.isBodyweight ? '自重' : `${set.weight}kg`}
                            </span>
                            <span className="mx-1.5 text-slate-600">×</span>
                            <span className="font-bold text-emerald-400">{set.reps}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {/* メモ */}
                  {session.notes && (
                    <div className="mt-3 pt-3 border-t border-slate-700/50 flex gap-2">
                      <span className="text-lg">📝</span>
                      <p className="text-xs text-slate-400 italic leading-relaxed pt-1">
                        {session.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};