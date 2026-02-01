import React, { useState, useMemo } from 'react';
import { WorkoutSession } from '../types';

interface WorkoutCalendarProps {
  sessions: WorkoutSession[];
  onDateClick: (date: string) => void;
  onSessionClick: (session: WorkoutSession) => void;
}

export const WorkoutCalendar: React.FC<WorkoutCalendarProps> = ({ sessions, onDateClick, onSessionClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // 月の最初の日と最後の日を取得
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // 日付ごとのセッション数を集計
  const sessionsByDate = useMemo(() => {
    const map = new Map<string, WorkoutSession[]>();
    sessions.forEach(session => {
      const date = session.date;
      if (!map.has(date)) {
        map.set(date, []);
      }
      map.get(date)!.push(session);
    });
    return map;
  }, [sessions]);

  // 前の月に移動
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  // 次の月に移動
  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // 今月に戻る
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // 日付が今日かどうか
  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  // 日付にセッションがあるかどうか
  const hasSessions = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return sessionsByDate.has(dateStr);
  };

  // 日付のセッションを取得
  const getSessionsForDate = (day: number): WorkoutSession[] => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return sessionsByDate.get(dateStr) || [];
  };

  // カレンダーの日付を生成
  const calendarDays = [];
  
  // 前月の空白セル
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // 今月の日付
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

  return (
    <div className="space-y-4 pb-20">
      {/* カレンダーヘッダー */}
      <div className="bg-card p-4 rounded-xl border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white">
              {year}年 {monthNames[month]}
            </h2>
            <button
              onClick={goToToday}
              className="text-xs text-primary hover:text-blue-400 px-2 py-1 rounded border border-primary/30 hover:border-primary/50"
            >
              今日
            </button>
          </div>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day, index) => (
            <div
              key={index}
              className={`text-center text-xs font-medium py-2 ${
                index === 0 ? 'text-red-400' : index === 6 ? 'text-blue-400' : 'text-slate-400'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* カレンダーグリッド */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const daySessions = getSessionsForDate(day);
            const hasSessionsForDay = daySessions.length > 0;
            const isTodayDate = isToday(day);

            return (
              <div
                key={day}
                className={`aspect-square relative rounded-lg border-2 transition-all cursor-pointer ${
                  isTodayDate
                    ? 'border-primary bg-primary/10'
                    : hasSessionsForDay
                    ? 'border-emerald-500/50 bg-emerald-500/10 hover:bg-emerald-500/20'
                    : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/50'
                }`}
                onClick={() => {
                  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  if (hasSessionsForDay) {
                    // セッションがある場合は最初のセッションを表示
                    onSessionClick(daySessions[0]);
                  } else {
                    // セッションがない場合は新規作成
                    onDateClick(dateStr);
                  }
                }}
              >
                <div className={`p-1 h-full flex flex-col ${
                  isTodayDate ? 'text-primary font-bold' : 'text-slate-300'
                }`}>
                  <div className="text-xs font-medium">{day}</div>
                  {hasSessionsForDay && (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="flex flex-wrap gap-0.5 justify-center">
                        {daySessions.slice(0, 3).map((_, i) => (
                          <div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                          />
                        ))}
                        {daySessions.length > 3 && (
                          <div className="text-[8px] text-emerald-400 font-bold">
                            +{daySessions.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 凡例と統計 */}
      <div className="bg-card p-4 rounded-xl border border-slate-700">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-primary bg-primary/10" />
            <span className="text-slate-400">今日</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-emerald-500/50 bg-emerald-500/10" />
            <span className="text-slate-400">トレーニング日</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-slate-700" />
            <span className="text-slate-400">通常日</span>
          </div>
        </div>
      </div>

      {/* 今月の統計 */}
      <div className="bg-card p-4 rounded-xl border border-slate-700">
        <h3 className="text-sm font-bold text-white mb-3">今月の統計</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-slate-400 mb-1">トレーニング日数</div>
            <div className="text-2xl font-bold text-emerald-400">
              {Array.from(sessionsByDate.keys()).filter(date => {
                const [y, m] = date.split('-').map(Number);
                return y === year && m === month + 1;
              }).length}日
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">総セッション数</div>
            <div className="text-2xl font-bold text-blue-400">
              {sessions.filter(s => {
                const [y, m] = s.date.split('-').map(Number);
                return y === year && m === month + 1;
              }).length}回
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
