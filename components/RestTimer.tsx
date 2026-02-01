import React, { useState, useEffect, useRef } from 'react';

interface RestTimerProps {
  onComplete?: () => void;
  initialSeconds?: number;
}

export const RestTimer: React.FC<RestTimerProps> = ({ onComplete, initialSeconds = 90 }) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsCompleted(true);
            if (onComplete) {
              setTimeout(() => onComplete(), 100);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, seconds, onComplete]);

  const start = () => {
    setIsRunning(true);
    setIsCompleted(false);
  };

  const pause = () => {
    setIsRunning(false);
  };

  const reset = () => {
    setIsRunning(false);
    setIsCompleted(false);
    setSeconds(initialSeconds);
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (initialSeconds - seconds) / initialSeconds * 100;

  return (
    <div className="bg-card p-4 rounded-xl border border-slate-700">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">⏱️</span>
          <span className="text-sm font-medium text-slate-300">休憩タイマー</span>
        </div>
        <div className="flex gap-2">
          {!isRunning && !isCompleted && (
            <button
              onClick={start}
              className="px-3 py-1 text-xs bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
            >
              開始
            </button>
          )}
          {isRunning && (
            <button
              onClick={pause}
              className="px-3 py-1 text-xs bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
            >
              一時停止
            </button>
          )}
          {(isCompleted || seconds < initialSeconds) && (
            <button
              onClick={reset}
              className="px-3 py-1 text-xs bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              リセット
            </button>
          )}
        </div>
      </div>

      <div className="relative">
        {/* プログレスバー */}
        <div className="w-full bg-slate-800 rounded-full h-2 mb-3">
          <div
            className={`h-2 rounded-full transition-all duration-1000 ${
              isCompleted ? 'bg-emerald-500' : 'bg-blue-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* タイマー表示 */}
        <div className="text-center">
          <div className={`text-4xl font-bold font-mono mb-2 ${
            isCompleted ? 'text-emerald-400' : seconds <= 10 ? 'text-red-400 animate-pulse' : 'text-white'
          }`}>
            {formatTime(seconds)}
          </div>
          {isCompleted && (
            <div className="text-sm text-emerald-400 font-medium animate-fadeIn">
              ✓ 休憩完了！
            </div>
          )}
        </div>

        {/* クイック設定ボタン */}
        {!isRunning && !isCompleted && (
          <div className="flex justify-center gap-2 mt-3">
            {[30, 60, 90, 120].map(sec => (
              <button
                key={sec}
                onClick={() => {
                  setSeconds(sec);
                  setIsCompleted(false);
                }}
                className={`px-2 py-1 text-xs rounded ${
                  seconds === sec
                    ? 'bg-primary text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {sec}秒
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
