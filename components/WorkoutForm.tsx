import React, { useState, useEffect, useRef } from 'react';
import { Exercise, WorkoutSession, WorkoutSet, MUSCLE_GROUPS, WorkoutTemplate } from '../types';
import { Button } from './ui/Button';
import { RestTimer } from './RestTimer';

interface WorkoutFormProps {
  onSubmit: (session: WorkoutSession) => void;
  onCancel: () => void;
  historyExerciseNames?: string[];
  initialData?: WorkoutSession | null;
  onOpenTemplates?: () => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const WorkoutForm: React.FC<WorkoutFormProps> = ({ onSubmit, onCancel, historyExerciseNames = [], initialData, onOpenTemplates }) => {
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tags || []);
  const [exercises, setExercises] = useState<Exercise[]>(
    initialData?.exercises || []
  );
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [cardioDuration, setCardioDuration] = useState<number | ''>(initialData?.cardioDuration || '');
  const [cardioDistance, setCardioDistance] = useState<number | ''>(initialData?.cardioDistance || '');
  const [startTime] = useState<string>(initialData?.startTime || new Date().toISOString());
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [showExerciseSuggestions, setShowExerciseSuggestions] = useState<{ [key: string]: boolean }>({});
  const exerciseInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Initialize with one empty exercise if new
  React.useEffect(() => {
    if (!initialData && exercises.length === 0) {
      setExercises([{
        id: generateId(),
        name: '',
        sets: [{ id: generateId(), weight: 0, reps: 0, isBodyweight: false }]
      }]);
    }
  }, [initialData, exercises.length]);

  // セッション時間の計測
  useEffect(() => {
    if (!initialData) {
      // 新規セッションの場合、経過時間を計測
      intervalRef.current = setInterval(() => {
        const now = new Date().getTime();
        const start = new Date(startTime).getTime();
        setElapsedTime(Math.floor((now - start) / 1000)); // 秒単位
      }, 1000);
    } else if (initialData.startTime && initialData.endTime) {
      // 既存セッションの場合、既存の時間を表示
      const start = new Date(initialData.startTime).getTime();
      const end = new Date(initialData.endTime).getTime();
      setElapsedTime(Math.floor((end - start) / 1000));
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [initialData, startTime]);

  const formatElapsedTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddExercise = () => {
    setExercises(prev => [
      ...prev,
      {
        id: generateId(),
        name: '',
        sets: [{ id: generateId(), weight: 0, reps: 0, isBodyweight: false }]
      }
    ]);
  };

  const updateExerciseName = (id: string, name: string) => {
    setExercises(prev => prev.map(ex => ex.id === id ? { ...ex, name } : ex));
  };

  const addSet = (exerciseId: string) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exerciseId) return ex;
      const lastSet = ex.sets[ex.sets.length - 1];
      return {
        ...ex,
        sets: [...ex.sets, { 
          id: generateId(), 
          weight: lastSet ? lastSet.weight : 0, 
          reps: lastSet ? lastSet.reps : 0,
          isBodyweight: lastSet ? lastSet.isBodyweight : false
        }]
      };
    }));
  };

  const updateSet = (exerciseId: string, setId: string, field: keyof WorkoutSet, value: any) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exerciseId) return ex;
      return {
        ...ex,
        sets: ex.sets.map(s => s.id === setId ? { ...s, [field]: value } : s)
      };
    }));
  };

  const removeSet = (exerciseId: string, setId: string) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exerciseId) return ex;
      return { ...ex, sets: ex.sets.filter(s => s.id !== setId) };
    }));
  };

  const removeExercise = (id: string) => {
    setExercises(prev => prev.filter(e => e.id !== id));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const endTime = new Date().toISOString();
    const duration = Math.floor(elapsedTime / 60); // 分単位
    
    const session: WorkoutSession = {
      id: initialData?.id || generateId(),
      date,
      exercises: exercises.filter(e => e.name.trim() !== ''),
      tags: selectedTags,
      notes,
      startTime: initialData?.startTime || startTime,
      endTime,
      duration,
      cardioDuration: typeof cardioDuration === 'number' ? cardioDuration : undefined,
      cardioDistance: typeof cardioDistance === 'number' ? cardioDistance : undefined
    };
    onSubmit(session);
  };

  // Get unique exercise names (remove duplicates and empty strings)
  const uniqueExerciseNames = React.useMemo(() => {
    const names = new Set<string>();
    historyExerciseNames.forEach(name => {
      const trimmed = name.trim();
      if (trimmed) names.add(trimmed);
    });
    return Array.from(names).sort();
  }, [historyExerciseNames]);

  // Filter exercise names based on input
  const getFilteredExercises = (exerciseId: string, inputValue: string) => {
    if (!inputValue.trim()) return uniqueExerciseNames;
    const lowerInput = inputValue.toLowerCase();
    return uniqueExerciseNames.filter(name => 
      name.toLowerCase().includes(lowerInput)
    );
  };

  const toggleExerciseSuggestions = (exerciseId: string) => {
    setShowExerciseSuggestions(prev => ({
      ...prev,
      [exerciseId]: !prev[exerciseId]
    }));
  };

  const selectExerciseName = (exerciseId: string, name: string) => {
    updateExerciseName(exerciseId, name);
    setShowExerciseSuggestions(prev => ({
      ...prev,
      [exerciseId]: false
    }));
    // Focus back to input
    exerciseInputRefs.current[exerciseId]?.focus();
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.exercise-input-container')) {
        setShowExerciseSuggestions({});
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-20">

      {/* セッション時間表示 */}
      {!initialData && (
        <div className="bg-card p-4 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">⏱️</span>
              <span className="text-sm text-slate-400">トレーニング時間</span>
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400">
              {formatElapsedTime(elapsedTime)}
            </div>
          </div>
        </div>
      )}

      {/* テンプレート選択 */}
      {!initialData && onOpenTemplates && (
        <div className="bg-card p-4 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">📋</span>
              <span className="text-sm text-slate-400">テンプレートから選択</span>
            </div>
            <button
              type="button"
              onClick={onOpenTemplates}
              className="text-xs text-primary hover:text-blue-400"
            >
              テンプレートを開く →
            </button>
          </div>
        </div>
      )}

      {/* 休憩タイマー */}
      <div className="bg-card p-4 rounded-xl border border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-400">休憩タイマー</span>
          <button
            type="button"
            onClick={() => setShowRestTimer(!showRestTimer)}
            className="text-xs text-primary hover:text-blue-400"
          >
            {showRestTimer ? '隠す' : '表示'}
          </button>
        </div>
        {showRestTimer && <RestTimer />}
      </div>

      <div className="bg-card p-4 rounded-xl border border-slate-700" style={{ overflow: 'hidden' }}>
        <label className="block text-sm text-slate-400 mb-1">日付</label>
        <div className="w-full" style={{ overflow: 'hidden', boxSizing: 'border-box' }}>
          <input 
            type="date" 
            required
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
            className="w-full bg-dark text-white rounded-lg border border-slate-600 focus:border-primary outline-none"
            style={{ 
              fontSize: '16px', 
              padding: '14px 12px',
              minHeight: '48px',
              lineHeight: '1.5',
              boxSizing: 'border-box',
              width: '100%',
              maxWidth: '100%',
              WebkitAppearance: 'none',
              MozAppearance: 'textfield',
              appearance: 'none',
              margin: 0,
              display: 'block'
            }}
          />
        </div>
      </div>

      <div className="bg-card p-4 rounded-xl border border-slate-700">
        <label className="block text-sm text-slate-400 mb-2">部位タグ</label>
        <div className="flex flex-wrap gap-2">
          {MUSCLE_GROUPS.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                selectedTags.includes(tag) 
                  ? 'bg-primary text-white' 
                  : 'bg-dark text-slate-400 border border-slate-600'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        
        {/* 有酸素タグが選択されている場合、時間と距離の入力欄を表示 */}
        {selectedTags.includes('有酸素 (Cardio)') && (
          <div className="mt-4 pt-4 border-t border-slate-700 space-y-3">
            <div className="text-sm text-slate-300 font-medium mb-2">🏃 有酸素運動の詳細</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">時間（分）</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={cardioDuration}
                  onChange={(e) => setCardioDuration(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                  placeholder="例: 30"
                  className="w-full bg-dark text-white p-2 rounded-lg border border-slate-600 focus:border-primary outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">距離（km）</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={cardioDistance}
                  onChange={(e) => setCardioDistance(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                  placeholder="例: 5.0"
                  className="w-full bg-dark text-white p-2 rounded-lg border border-slate-600 focus:border-primary outline-none text-sm"
                />
              </div>
            </div>
            {/* 速度の自動計算表示 */}
            {typeof cardioDuration === 'number' && cardioDuration > 0 && typeof cardioDistance === 'number' && cardioDistance > 0 && (
              <div className="mt-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">平均速度</span>
                  <span className="text-lg font-bold text-emerald-400 font-mono">
                    {(cardioDistance / (cardioDuration / 60)).toFixed(2)} km/h
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {exercises.map((exercise, index) => {
          const filteredExercises = getFilteredExercises(exercise.id, exercise.name);
          const showSuggestions = showExerciseSuggestions[exercise.id] && filteredExercises.length > 0;
          
          return (
            <div key={exercise.id} className="bg-card p-4 rounded-xl border border-slate-700 animate-fadeIn">
              <div className="flex justify-between items-center mb-3 relative exercise-input-container">
                <div className="flex-1 relative">
                  <input
                    ref={(el) => { exerciseInputRefs.current[exercise.id] = el; }}
                    type="text"
                    placeholder="種目名 (例: ベンチプレス)"
                    value={exercise.name}
                    onChange={(e) => updateExerciseName(exercise.id, e.target.value)}
                    onFocus={() => {
                      if (filteredExercises.length > 0) {
                        setShowExerciseSuggestions(prev => ({ ...prev, [exercise.id]: true }));
                      }
                    }}
                    className="w-full bg-transparent text-lg font-bold text-white placeholder-slate-500 outline-none border-b border-transparent focus:border-primary pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => toggleExerciseSuggestions(exercise.id)}
                    className="absolute right-0 top-0 bottom-0 flex items-center text-slate-400 hover:text-primary transition-colors px-2"
                    title="候補を表示"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Exercise Suggestions Dropdown */}
                  {showSuggestions && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-h-48 overflow-y-auto z-50">
                      {filteredExercises.length > 0 ? (
                        filteredExercises.map((name, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => selectExerciseName(exercise.id, name)}
                            className="w-full text-left px-4 py-2 text-white hover:bg-primary/20 transition-colors border-b border-slate-700 last:border-b-0"
                          >
                            {name}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-slate-400 text-sm">
                          候補が見つかりません
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <button 
                  type="button" 
                  onClick={() => removeExercise(exercise.id)}
                  className="text-red-400 hover:text-red-300 ml-2"
                >
                  ✕
                </button>
              </div>

            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 text-xs text-slate-500 text-center mb-1">
                <span className="col-span-1">No.</span>
                <span className="col-span-5">負荷 (Weight)</span>
                <span className="col-span-4">回数 (Reps)</span>
                <span className="col-span-2"></span>
              </div>
              {exercise.sets.map((set, sIndex) => (
                <div key={set.id} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-1 flex justify-center items-center">
                    <span className="w-6 h-6 rounded-full bg-slate-700 text-xs flex items-center justify-center text-slate-300">
                      {sIndex + 1}
                    </span>
                  </div>
                  
                  {/* Weight / Bodyweight Selector and Input */}
                  <div className="col-span-5 flex gap-1">
                     <select
                        value={set.isBodyweight ? "bw" : "kg"}
                        onChange={(e) => {
                           const isBw = e.target.value === "bw";
                           updateSet(exercise.id, set.id, 'isBodyweight', isBw);
                           if (isBw) updateSet(exercise.id, set.id, 'weight', 0);
                        }}
                        className="w-16 bg-slate-800 text-white text-xs rounded border border-slate-600 outline-none focus:border-primary p-1 cursor-pointer"
                     >
                        <option value="kg">kg</option>
                        <option value="bw">自重</option>
                     </select>
                     
                     <input
                        type="number"
                        placeholder={set.isBodyweight ? "-" : "kg"}
                        disabled={!!set.isBodyweight}
                        value={set.isBodyweight ? "" : (set.weight || '')}
                        onChange={(e) => updateSet(exercise.id, set.id, 'weight', parseFloat(e.target.value) || 0)}
                        className={`flex-1 min-w-0 bg-dark text-center py-2 rounded border border-slate-600 focus:border-primary outline-none text-white ${set.isBodyweight ? 'opacity-30 cursor-not-allowed bg-slate-900 border-slate-800' : ''}`}
                     />
                  </div>

                  <input
                    type="number"
                    placeholder="reps"
                    value={set.reps || ''}
                    onChange={(e) => updateSet(exercise.id, set.id, 'reps', parseFloat(e.target.value) || 0)}
                    className="col-span-4 bg-dark text-center py-2 rounded border border-slate-600 focus:border-primary outline-none text-white"
                  />
                  
                  <div className="col-span-2 flex justify-center">
                    <button
                      type="button"
                      onClick={() => removeSet(exercise.id, set.id)}
                      className="text-slate-500 hover:text-red-400 w-8 h-8 flex items-center justify-center rounded hover:bg-slate-700/50"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <button
              type="button"
              onClick={() => addSet(exercise.id)}
              className="mt-3 w-full py-2 text-sm text-primary border border-dashed border-primary/30 hover:bg-primary/10 rounded-lg transition-colors"
            >
              + セット追加
            </button>
            </div>
          );
        })}

        <Button 
          type="button" 
          variant="secondary" 
          onClick={handleAddExercise} 
          className="w-full py-3 border-dashed"
        >
          + 種目追加
        </Button>
      </div>

      <div className="bg-card p-4 rounded-xl border border-slate-700">
        <label className="block text-sm text-slate-400 mb-2">メモ・感想</label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full bg-dark text-white p-3 rounded-lg border border-slate-600 focus:border-primary outline-none"
          placeholder="今日の調子はどうでしたか？"
        />
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-dark/80 backdrop-blur-md border-t border-slate-800 flex gap-4">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
          キャンセル
        </Button>
        <Button type="submit" className="flex-1">
          {initialData ? '更新する' : '記録を保存'}
        </Button>
      </div>
    </form>
  );
};