import React, { useMemo, useState } from 'react';
import { WorkoutSession } from '../types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface StatisticsProps {
  sessions: WorkoutSession[];
}

interface ExerciseStats {
  name: string;
  totalVolume: number;
  maxWeight: number;
  maxReps: number;
  totalSets: number;
  lastDate: string;
}

// 1RM推定（Epley式）
const calculate1RM = (weight: number, reps: number): number => {
  if (reps === 0) return 0;
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
};

export const Statistics: React.FC<StatisticsProps> = ({ sessions }) => {
  const [selectedExercise, setSelectedExercise] = useState<string>('');

  // 合計Volume計算
  const totalVolume = useMemo(() => {
    return sessions.reduce((total, session) => {
      return total + session.exercises.reduce((exTotal, ex) => {
        return exTotal + ex.sets.reduce((setTotal, set) => {
          if (set.isBodyweight) return setTotal;
          return setTotal + (set.weight * set.reps);
        }, 0);
      }, 0);
    }, 0);
  }, [sessions]);

  // 種目別統計
  const exerciseStats = useMemo(() => {
    const statsMap = new Map<string, ExerciseStats>();

    sessions.forEach(session => {
      session.exercises.forEach(ex => {
        if (!ex.name.trim()) return;

        const existing = statsMap.get(ex.name) || {
          name: ex.name,
          totalVolume: 0,
          maxWeight: 0,
          maxReps: 0,
          totalSets: 0,
          lastDate: session.date
        };

        ex.sets.forEach(set => {
          if (!set.isBodyweight) {
            existing.totalVolume += set.weight * set.reps;
            existing.maxWeight = Math.max(existing.maxWeight, set.weight);
          }
          existing.maxReps = Math.max(existing.maxReps, set.reps);
          existing.totalSets += 1;
        });

        if (session.date > existing.lastDate) {
          existing.lastDate = session.date;
        }

        statsMap.set(ex.name, existing);
      });
    });

    return Array.from(statsMap.values()).sort((a, b) => b.totalVolume - a.totalVolume);
  }, [sessions]);

  // 選択された種目の進捗データ
  const exerciseProgress = useMemo(() => {
    if (!selectedExercise) return null;

    const progressData = sessions
      .filter(session => 
        session.exercises.some(ex => ex.name === selectedExercise)
      )
      .map(session => {
        const exercise = session.exercises.find(ex => ex.name === selectedExercise);
        if (!exercise) return null;

        const maxWeight = Math.max(...exercise.sets
          .filter(set => !set.isBodyweight)
          .map(set => set.weight), 0);
        const maxReps = Math.max(...exercise.sets.map(set => set.reps), 0);
        const volume = exercise.sets.reduce((total, set) => {
          if (set.isBodyweight) return total;
          return total + (set.weight * set.reps);
        }, 0);
        const estimated1RM = Math.max(...exercise.sets
          .filter(set => !set.isBodyweight)
          .map(set => calculate1RM(set.weight, set.reps)), 0);

        return {
          date: session.date,
          maxWeight,
          maxReps,
          volume,
          estimated1RM
        };
      })
      .filter(Boolean)
      .sort((a, b) => new Date(a!.date).getTime() - new Date(b!.date).getTime());

    return progressData;
  }, [sessions, selectedExercise]);

  // ボリューム推移（全種目合計）
  const volumeTrend = useMemo(() => {
    const volumeByDate = new Map<string, number>();

    sessions.forEach(session => {
      const sessionVolume = session.exercises.reduce((total, ex) => {
        return total + ex.sets.reduce((setTotal, set) => {
          if (set.isBodyweight) return setTotal;
          return setTotal + (set.weight * set.reps);
        }, 0);
      }, 0);

      volumeByDate.set(session.date, (volumeByDate.get(session.date) || 0) + sessionVolume);
    });

    const sortedDates = Array.from(volumeByDate.keys())
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      .slice(-30); // 直近30日

    return {
      labels: sortedDates,
      volumes: sortedDates.map(date => volumeByDate.get(date) || 0)
    };
  }, [sessions]);

  // PR（Personal Record）記録
  const personalRecords = useMemo(() => {
    const prs: Array<{ exercise: string; type: string; value: string; date: string; estimated1RM?: number }> = [];

    exerciseStats.forEach(stat => {
      if (stat.maxWeight > 0) {
        // 最大重量のセッションを探して1RM推定
        const maxWeightSession = sessions
          .flatMap(s => s.exercises.map(ex => ({ ...ex, date: s.date })))
          .find(ex => ex.name === stat.name && 
            ex.sets.some(set => !set.isBodyweight && set.weight === stat.maxWeight));
        
        let estimated1RM = 0;
        if (maxWeightSession) {
          const maxSet = maxWeightSession.sets
            .filter(set => !set.isBodyweight && set.weight === stat.maxWeight)
            .sort((a, b) => b.reps - a.reps)[0];
          if (maxSet) {
            estimated1RM = calculate1RM(maxSet.weight, maxSet.reps);
          }
        }

        prs.push({
          exercise: stat.name,
          type: '最大重量',
          value: `${stat.maxWeight}kg`,
          date: stat.lastDate,
          estimated1RM
        });
      }
      if (stat.maxReps > 0) {
        prs.push({
          exercise: stat.name,
          type: '最大回数',
          value: `${stat.maxReps}reps`,
          date: stat.lastDate
        });
      }
    });

    return prs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [exerciseStats, sessions]);

  // 部位別のトレーニング頻度
  const tagFrequency = useMemo(() => {
    const tagMap = new Map<string, number>();
    sessions.forEach(session => {
      session.tags.forEach(tag => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
      });
    });
    return Array.from(tagMap.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }, [sessions]);

  // 週間・月間のトレーニング回数
  const weeklyCount = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return sessions.filter(s => new Date(s.date) >= weekAgo).length;
  }, [sessions]);

  const monthlyCount = useMemo(() => {
    const now = new Date();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return sessions.filter(s => new Date(s.date) >= monthAgo).length;
  }, [sessions]);

  // 最近のトレーニング日
  const recentDates = useMemo(() => {
    return sessions
      .map(s => s.date)
      .filter((date, index, self) => self.indexOf(date) === index)
      .sort((a, b) => b.localeCompare(a))
      .slice(0, 7);
  }, [sessions]);

  // チャートのオプション
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#e2e8f0'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#e2e8f0',
        bodyColor: '#e2e8f0',
        borderColor: '#334155',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(148, 163, 184, 0.1)' }
      },
      y: {
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(148, 163, 184, 0.1)' }
      }
    }
  };

  if (sessions.length === 0) {
    return (
      <div className="text-center py-20 text-slate-500">
        <div className="text-6xl mb-4">📊</div>
        <p>統計データがありません。</p>
        <p className="text-sm mt-2">トレーニング記録を追加すると、統計が表示されます。</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* サマリーカード */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card p-4 rounded-xl border border-slate-700">
          <div className="text-sm text-slate-400 mb-1">総トレーニング回数</div>
          <div className="text-3xl font-bold text-white">{sessions.length}</div>
        </div>
        <div className="bg-card p-4 rounded-xl border border-slate-700">
          <div className="text-sm text-slate-400 mb-1">総挙上重量</div>
          <div className="text-3xl font-bold text-emerald-400">{totalVolume.toLocaleString()}kg</div>
        </div>
        <div className="bg-card p-4 rounded-xl border border-slate-700">
          <div className="text-sm text-slate-400 mb-1">週間トレーニング</div>
          <div className="text-3xl font-bold text-blue-400">{weeklyCount}回</div>
        </div>
        <div className="bg-card p-4 rounded-xl border border-slate-700">
          <div className="text-sm text-slate-400 mb-1">月間トレーニング</div>
          <div className="text-3xl font-bold text-purple-400">{monthlyCount}回</div>
        </div>
      </div>

      {/* ボリューム推移グラフ */}
      {volumeTrend.labels.length > 0 && (
        <div className="bg-card p-4 rounded-xl border border-slate-700">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            📈 ボリューム推移（直近30日）
          </h2>
          <div className="h-64">
            <Line
              data={{
                labels: volumeTrend.labels.map(date => {
                  const d = new Date(date);
                  return `${d.getMonth() + 1}/${d.getDate()}`;
                }),
                datasets: [
                  {
                    label: '総ボリューム (kg)',
                    data: volumeTrend.volumes,
                    borderColor: 'rgb(16, 185, 129)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4
                  }
                ]
              }}
              options={chartOptions}
            />
          </div>
        </div>
      )}

      {/* 種目別進捗グラフ */}
      {exerciseStats.length > 0 && (
        <div className="bg-card p-4 rounded-xl border border-slate-700">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            📊 種目別進捗分析
          </h2>
          <div className="mb-4">
            <select
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              className="w-full bg-dark text-white border border-slate-600 rounded-lg px-4 py-2 focus:border-primary outline-none"
            >
              <option value="">種目を選択してください</option>
              {exerciseStats.map(stat => (
                <option key={stat.name} value={stat.name}>
                  {stat.name}
                </option>
              ))}
            </select>
          </div>

          {selectedExercise && exerciseProgress && exerciseProgress.length > 0 && (
            <div className="space-y-4">
              {/* 重量・回数推移 */}
              <div className="h-64">
                <Line
                  data={{
                    labels: exerciseProgress.map(p => {
                      const d = new Date(p!.date);
                      return `${d.getMonth() + 1}/${d.getDate()}`;
                    }),
                    datasets: [
                      {
                        label: '最大重量 (kg)',
                        data: exerciseProgress.map(p => p!.maxWeight),
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        yAxisID: 'y',
                        fill: false,
                        tension: 0.4
                      },
                      {
                        label: '最大回数 (reps)',
                        data: exerciseProgress.map(p => p!.maxReps),
                        borderColor: 'rgb(168, 85, 247)',
                        backgroundColor: 'rgba(168, 85, 247, 0.1)',
                        yAxisID: 'y1',
                        fill: false,
                        tension: 0.4
                      }
                    ]
                  }}
                  options={{
                    ...chartOptions,
                    scales: {
                      ...chartOptions.scales,
                      y: {
                        ...chartOptions.scales.y,
                        position: 'left' as const,
                        title: {
                          display: true,
                          text: '重量 (kg)',
                          color: '#94a3b8'
                        }
                      },
                      y1: {
                        type: 'linear' as const,
                        display: true,
                        position: 'right' as const,
                        title: {
                          display: true,
                          text: '回数 (reps)',
                          color: '#94a3b8'
                        },
                        ticks: { color: '#94a3b8' },
                        grid: { drawOnChartArea: false }
                      }
                    }
                  }}
                />
              </div>

              {/* ボリューム推移 */}
              <div className="h-64">
                <Bar
                  data={{
                    labels: exerciseProgress.map(p => {
                      const d = new Date(p!.date);
                      return `${d.getMonth() + 1}/${d.getDate()}`;
                    }),
                    datasets: [
                      {
                        label: 'ボリューム (kg)',
                        data: exerciseProgress.map(p => p!.volume),
                        backgroundColor: 'rgba(16, 185, 129, 0.6)',
                        borderColor: 'rgb(16, 185, 129)',
                        borderWidth: 1
                      }
                    ]
                  }}
                  options={chartOptions}
                />
              </div>

              {/* 1RM推定推移 */}
              {exerciseProgress.some(p => p!.estimated1RM > 0) && (
                <div className="h-64">
                  <Line
                    data={{
                      labels: exerciseProgress.map(p => {
                        const d = new Date(p!.date);
                        return `${d.getMonth() + 1}/${d.getDate()}`;
                      }),
                      datasets: [
                        {
                          label: '推定1RM (kg)',
                          data: exerciseProgress.map(p => p!.estimated1RM),
                          borderColor: 'rgb(239, 68, 68)',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          fill: true,
                          tension: 0.4
                        }
                      ]
                    }}
                    options={chartOptions}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* PR記録（1RM推定付き） */}
      {personalRecords.length > 0 && (
        <div className="bg-card p-4 rounded-xl border border-slate-700">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            🏆 パーソナルレコード
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {personalRecords.slice(0, 8).map((pr, index) => (
              <div key={index} className="bg-dark/50 p-3 rounded-lg border border-slate-600">
                <div className="text-xs text-slate-400 mb-1">{pr.exercise}</div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-300">{pr.type}</span>
                  <span className="text-lg font-bold text-emerald-400">{pr.value}</span>
                </div>
                {pr.estimated1RM && pr.estimated1RM > 0 && (
                  <div className="text-xs text-red-400 mt-1">
                    推定1RM: {pr.estimated1RM.toFixed(1)}kg
                  </div>
                )}
                <div className="text-xs text-slate-500 mt-1">{pr.date}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 部位別頻度 */}
      {tagFrequency.length > 0 && (
        <div className="bg-card p-4 rounded-xl border border-slate-700">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            🎯 部位別トレーニング頻度
          </h2>
          <div className="space-y-2">
            {tagFrequency.map(({ tag, count }) => {
              const maxCount = tagFrequency[0]?.count || 1;
              const percentage = (count / maxCount) * 100;
              return (
                <div key={tag} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">{tag}</span>
                    <span className="text-slate-400 font-mono">{count}回</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-400 to-emerald-400 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 種目別統計 */}
      {exerciseStats.length > 0 && (
        <div className="bg-card p-4 rounded-xl border border-slate-700">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            📈 種目別統計（Top 10）
          </h2>
          <div className="space-y-3">
            {exerciseStats.slice(0, 10).map((stat, index) => (
              <div key={stat.name} className="bg-dark/50 p-3 rounded-lg border border-slate-600">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded font-mono">
                      #{index + 1}
                    </span>
                    <span className="font-bold text-white">{stat.name}</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <div className="text-slate-400">総Volume</div>
                    <div className="text-emerald-400 font-bold">{stat.totalVolume.toLocaleString()}kg</div>
                  </div>
                  <div>
                    <div className="text-slate-400">最大重量</div>
                    <div className="text-blue-400 font-bold">{stat.maxWeight > 0 ? `${stat.maxWeight}kg` : '-'}</div>
                  </div>
                  <div>
                    <div className="text-slate-400">最大回数</div>
                    <div className="text-purple-400 font-bold">{stat.maxReps}reps</div>
                  </div>
                </div>
                <div className="text-xs text-slate-500 mt-2">総セット数: {stat.totalSets} | 最終: {stat.lastDate}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 最近のトレーニング日 */}
      {recentDates.length > 0 && (
        <div className="bg-card p-4 rounded-xl border border-slate-700">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            📅 最近のトレーニング日
          </h2>
          <div className="flex flex-wrap gap-2">
            {recentDates.map((date, index) => (
              <span
                key={date}
                className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                  index === 0
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}
              >
                {date}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
