import React, { useState, useEffect } from 'react';
import { WorkoutTemplate, Exercise, MUSCLE_GROUPS } from '../types';
import { Button } from './ui/Button';

interface TemplateManagerProps {
  onSelectTemplate: (template: WorkoutTemplate) => void;
  onClose: () => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const TemplateManager: React.FC<TemplateManagerProps> = ({ onSelectTemplate, onClose }) => {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplate | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [templateNotes, setTemplateNotes] = useState('');

  // Load templates from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ironlog_templates');
    if (saved) {
      try {
        setTemplates(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse templates", e);
      }
    }
  }, []);

  // Save templates to localStorage
  const saveTemplates = (newTemplates: WorkoutTemplate[]) => {
    localStorage.setItem('ironlog_templates', JSON.stringify(newTemplates));
    setTemplates(newTemplates);
  };

  const handleCreateTemplate = () => {
    setIsCreating(true);
    setEditingTemplate(null);
    setTemplateName('');
    setSelectedTags([]);
    setExercises([{
      id: generateId(),
      name: '',
      sets: [{ id: generateId(), weight: 0, reps: 0, isBodyweight: false }]
    }]);
    setTemplateNotes('');
  };

  const handleEditTemplate = (template: WorkoutTemplate) => {
    setEditingTemplate(template);
    setIsCreating(false);
    setTemplateName(template.name);
    setSelectedTags(template.tags);
    setExercises(template.exercises);
    setTemplateNotes(template.notes || '');
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm('このテンプレートを削除しますか？')) {
      saveTemplates(templates.filter(t => t.id !== id));
    }
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      alert('テンプレート名を入力してください');
      return;
    }

    const validExercises = exercises.filter(e => e.name.trim() !== '');
    if (validExercises.length === 0) {
      alert('少なくとも1つの種目を追加してください');
      return;
    }

    const template: WorkoutTemplate = {
      id: editingTemplate?.id || generateId(),
      name: templateName.trim(),
      exercises: validExercises,
      tags: selectedTags,
      notes: templateNotes,
      createdAt: editingTemplate?.createdAt || new Date().toISOString()
    };

    if (editingTemplate) {
      saveTemplates(templates.map(t => t.id === editingTemplate.id ? template : t));
    } else {
      saveTemplates([...templates, template]);
    }

    // Reset form
    setIsCreating(false);
    setEditingTemplate(null);
    setTemplateName('');
    setSelectedTags([]);
    setExercises([]);
    setTemplateNotes('');
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingTemplate(null);
    setTemplateName('');
    setSelectedTags([]);
    setExercises([]);
    setTemplateNotes('');
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const addExercise = () => {
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

  const updateSet = (exerciseId: string, setId: string, field: keyof typeof exercises[0]['sets'][0], value: any) => {
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

  if (isCreating || editingTemplate) {
    return (
      <div className="space-y-6 pb-20">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {editingTemplate ? 'テンプレートを編集' : '新しいテンプレート'}
          </h2>
          <button
            onClick={handleCancel}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="bg-card p-4 rounded-xl border border-slate-700">
          <label className="block text-sm text-slate-400 mb-2">テンプレート名</label>
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="例: 胸の日メニュー"
            className="w-full bg-dark text-white p-3 rounded-lg border border-slate-600 focus:border-primary outline-none"
          />
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
        </div>

        <div className="space-y-4">
          {exercises.map((exercise) => (
            <div key={exercise.id} className="bg-card p-4 rounded-xl border border-slate-700">
              <div className="flex justify-between items-center mb-3">
                <input
                  type="text"
                  placeholder="種目名"
                  value={exercise.name}
                  onChange={(e) => updateExerciseName(exercise.id, e.target.value)}
                  className="flex-1 bg-transparent text-lg font-bold text-white placeholder-slate-500 outline-none border-b border-transparent focus:border-primary mr-4"
                />
                <button 
                  type="button" 
                  onClick={() => removeExercise(exercise.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                {exercise.sets.map((set, sIndex) => (
                  <div key={set.id} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-1 flex justify-center">
                      <span className="text-xs text-slate-500">{sIndex + 1}</span>
                    </div>
                    <div className="col-span-5 flex gap-1">
                      <select
                        value={set.isBodyweight ? "bw" : "kg"}
                        onChange={(e) => {
                          const isBw = e.target.value === "bw";
                          updateSet(exercise.id, set.id, 'isBodyweight', isBw);
                          if (isBw) updateSet(exercise.id, set.id, 'weight', 0);
                        }}
                        className="w-16 bg-slate-800 text-white text-xs rounded border border-slate-600 outline-none p-1"
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
                        className={`flex-1 bg-dark text-center py-2 rounded border border-slate-600 outline-none text-white text-sm ${set.isBodyweight ? 'opacity-30' : ''}`}
                      />
                    </div>
                    <input
                      type="number"
                      placeholder="reps"
                      value={set.reps || ''}
                      onChange={(e) => updateSet(exercise.id, set.id, 'reps', parseFloat(e.target.value) || 0)}
                      className="col-span-4 bg-dark text-center py-2 rounded border border-slate-600 outline-none text-white text-sm"
                    />
                    <div className="col-span-2 flex justify-center">
                      <button
                        type="button"
                        onClick={() => removeSet(exercise.id, set.id)}
                        className="text-slate-500 hover:text-red-400"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addSet(exercise.id)}
                  className="w-full py-1 text-xs text-primary border border-dashed border-primary/30 hover:bg-primary/10 rounded transition-colors"
                >
                  + セット追加
                </button>
              </div>
            </div>
          ))}
          <Button 
            type="button" 
            variant="secondary" 
            onClick={addExercise} 
            className="w-full py-3 border-dashed"
          >
            + 種目追加
          </Button>
        </div>

        <div className="bg-card p-4 rounded-xl border border-slate-700">
          <label className="block text-sm text-slate-400 mb-2">メモ（任意）</label>
          <textarea
            rows={2}
            value={templateNotes}
            onChange={(e) => setTemplateNotes(e.target.value)}
            className="w-full bg-dark text-white p-3 rounded-lg border border-slate-600 focus:border-primary outline-none text-sm"
            placeholder="テンプレートのメモ"
          />
        </div>

        <div className="flex gap-4">
          <Button type="button" variant="ghost" onClick={handleCancel} className="flex-1">
            キャンセル
          </Button>
          <Button type="button" onClick={handleSaveTemplate} className="flex-1">
            保存
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">テンプレート管理</h2>
        <div className="flex gap-2">
          <Button onClick={handleCreateTemplate} className="text-sm">
            + 新規作成
          </Button>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <div className="text-6xl mb-4">📋</div>
          <p>テンプレートがありません。</p>
          <p className="text-sm mt-2">よく使うメニューをテンプレートとして保存できます。</p>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map((template) => (
            <div key={template.id} className="bg-card p-4 rounded-xl border border-slate-700">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1">{template.name}</h3>
                  {template.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {template.tags.map(tag => (
                        <span key={tag} className="text-xs bg-slate-700 text-slate-200 px-2 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="text-xs text-slate-400">
                    {template.exercises.length}種目
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onSelectTemplate(template)}
                    className="px-3 py-1.5 text-xs bg-primary hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    使用
                  </button>
                  <button
                    onClick={() => handleEditTemplate(template)}
                    className="px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="px-3 py-1.5 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                  >
                    削除
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {template.exercises.slice(0, 3).map((ex) => (
                  <div key={ex.id} className="text-sm text-slate-300">
                    {ex.name} - {ex.sets.length}セット
                  </div>
                ))}
                {template.exercises.length > 3 && (
                  <div className="text-xs text-slate-500">
                    +{template.exercises.length - 3}種目
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
