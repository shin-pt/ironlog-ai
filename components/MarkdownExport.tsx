import React, { useState, useEffect } from 'react';
import { WorkoutSession } from '../types';
import { generateMarkdownSummary } from '../services/geminiService';
import { Button } from './ui/Button';
import { getStoredDirectoryHandle, storeDirectoryHandle } from '../services/fileStorage';

interface MarkdownExportProps {
  sessions: WorkoutSession[];
}

export const MarkdownExport: React.FC<MarkdownExportProps> = ({ sessions }) => {
  const [markdown, setMarkdown] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [dirHandle, setDirHandle] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isFsaSupported, setIsFsaSupported] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSessions, setSelectedSessions] = useState<WorkoutSession[]>([]);
  const [folderInputMode, setFolderInputMode] = useState<'manual' | 'auto'>('manual'); // 'manual' = 手動入力, 'auto' = 自動保存（推奨: manual）
  const [outputFormat, setOutputFormat] = useState<'markdown' | 'instagram'>('markdown');

  useEffect(() => {
    // Check if File System Access API is supported
    const checkSupport = async () => {
      // File System Access API (showDirectoryPicker) is supported on desktop Chrome/Edge
      // For mobile, we'll use webkitdirectory input as fallback
      if (typeof window !== 'undefined' && 'showDirectoryPicker' in window) {
        setIsFsaSupported(true);
        // Try to load stored directory handle
        try {
          const handle = await getStoredDirectoryHandle();
          if (handle) {
            setDirHandle(handle);
          }
        } catch (e) {
          // Ignore errors
        }
      } else {
        // Mobile devices: use webkitdirectory as fallback
        setIsFsaSupported(true); // Enable folder selection UI for mobile too
        
        // Try to load stored mobile folder selection
        try {
          const stored = localStorage.getItem('ironlog_mobile_folder');
          if (stored) {
            const folderInfo = JSON.parse(stored);
            // Check if stored folder info is recent (within 24 hours)
            if (Date.now() - folderInfo.timestamp < 24 * 60 * 60 * 1000) {
              setDirHandle({
                name: folderInfo.name,
                isMobile: true
              });
            }
          }
        } catch (e) {
          // Ignore errors
        }
      }
    };
    checkSupport();
  }, []);

  // Force re-render when dirHandle changes (for debugging)
  useEffect(() => {
    console.log('dirHandle changed:', dirHandle);
  }, [dirHandle]);

  // Get unique dates from sessions
  const availableDates = React.useMemo(() => {
    const dates = Array.from(new Set(sessions.map(s => s.date))).sort().reverse();
    return dates;
  }, [sessions]);

  // Filter sessions by selected date
  useEffect(() => {
    if (selectedDate) {
      const filtered = sessions.filter(s => s.date === selectedDate);
      setSelectedSessions(filtered);
    } else {
      // Default: use today's date if available, otherwise all sessions
      const today = new Date().toISOString().split('T')[0];
      const todaySessions = sessions.filter(s => s.date === today);
      if (todaySessions.length > 0) {
        setSelectedDate(today);
        setSelectedSessions(todaySessions);
      } else {
        setSelectedSessions(sessions);
      }
    }
  }, [selectedDate, sessions]);

  // Check localStorage periodically to detect folder selection (mobile workaround)
  useEffect(() => {
    if (!isFsaSupported || typeof window === 'undefined' || 'showDirectoryPicker' in window) {
      return; // Only for mobile
    }

    const checkInterval = setInterval(() => {
      try {
        const stored = localStorage.getItem('ironlog_mobile_folder');
        if (stored) {
          const folderInfo = JSON.parse(stored);
          // If folder was just selected (within last 5 seconds)
          if (Date.now() - folderInfo.timestamp < 5000) {
            if (!dirHandle || dirHandle.name !== folderInfo.name) {
              console.log('Detected folder selection from localStorage:', folderInfo.name);
              setDirHandle({
                name: folderInfo.name,
                isMobile: true
              });
            }
          }
        }
      } catch (e) {
        // Ignore errors
      }
    }, 500);

    return () => clearInterval(checkInterval);
  }, [isFsaSupported, dirHandle]);

  // Simple pure JS generation as fallback/immediate option
  const generateSimpleMarkdown = () => {
    const sessionsToUse = selectedSessions.length > 0 ? selectedSessions : sessions;
    const displayDate = selectedDate || new Date().toISOString().split('T')[0];
    const dateObj = new Date(displayDate);
    let md = `# 筋トレログ (${dateObj.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })})\n\n`;
    
    sessionsToUse.forEach(session => {
      md += `## ${session.date}\n`;
      if (session.tags.length > 0) {
          md += `**部位:** ${session.tags.join(', ')}\n\n`;
      }
      
      session.exercises.forEach(ex => {
        md += `### ${ex.name}\n`;
        ex.sets.forEach((set, i) => {
          const weightStr = set.isBodyweight ? '自重' : `${set.weight}kg`;
          md += `- Set ${i + 1}: ${weightStr} x ${set.reps}reps\n`;
        });
        md += '\n';
      });

      if (session.notes) {
        md += `> **Memo:** ${session.notes}\n`;
      }
      md += `\n---\n\n`;
    });
    setMarkdown(md);
  };

  // Generate Instagram caption format
  const generateInstagramCaption = () => {
    const sessionsToUse = selectedSessions.length > 0 ? selectedSessions : sessions;
    const displayDate = selectedDate || new Date().toISOString().split('T')[0];
    const dateObj = new Date(displayDate);
    const dateStr = dateObj.toLocaleDateString('ja-JP', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'short'
    });

    let caption = `💪 筋トレログ ${dateStr}\n\n`;

    sessionsToUse.forEach((session, sessionIndex) => {
      // 部位タグ
      if (session.tags.length > 0) {
        const tagEmojis: { [key: string]: string } = {
          '胸 (Chest)': '🏋️',
          '背中 (Back)': '💪',
          '脚 (Legs)': '🦵',
          '肩 (Shoulders)': '💪',
          '腕 (Arms)': '💪',
          '腹筋 (Abs)': '🔥',
          '有酸素 (Cardio)': '🏃'
        };
        const tagEmoji = session.tags.map(tag => tagEmojis[tag] || '💪').join('');
        caption += `${tagEmoji} ${session.tags.join(' ')}\n\n`;
      }

      // 種目とセット
      session.exercises.forEach((ex, exIndex) => {
        caption += `🔸 ${ex.name}\n`;
        ex.sets.forEach((set, setIndex) => {
          const weightStr = set.isBodyweight ? '自重' : `${set.weight}kg`;
          caption += `  ${setIndex + 1}セット目: ${weightStr} × ${set.reps}回\n`;
        });
        if (exIndex < session.exercises.length - 1) {
          caption += '\n';
        }
      });

      // 総ボリューム計算
      const totalVolume = session.exercises.reduce((total, ex) => {
        return total + ex.sets.reduce((exTotal, set) => {
          if (set.isBodyweight) return exTotal;
          return exTotal + (set.weight * set.reps);
        }, 0);
      }, 0);

      caption += `\n📊 総Volume: ${totalVolume.toLocaleString()}kg\n`;
      caption += `📈 種目数: ${session.exercises.length}種目\n`;

      // セッション時間
      if (session.duration) {
        caption += `⏱️ トレーニング時間: ${session.duration}分\n`;
      }

      // メモ
      if (session.notes) {
        caption += `\n💭 ${session.notes}\n`;
      }

      if (sessionIndex < sessionsToUse.length - 1) {
        caption += '\n━━━━━━━━━━━━━━━━\n\n';
      }
    });

    // ハッシュタグ（5つまで）
    caption += '\n';
    caption += '#筋トレ #トレーニング #フィットネス #ワークアウト #MuscleDiary';

    setMarkdown(caption);
  };

  const handleAiGenerate = async () => {
    setIsGenerating(true);
    try {
      const sessionsToUse = selectedSessions.length > 0 ? selectedSessions : sessions;
      if (sessionsToUse.length === 0) {
        alert('出力するセッションがありません。日付を選択してください。');
        setIsGenerating(false);
        return;
      }
      const result = await generateMarkdownSummary(sessionsToUse);
      setMarkdown(result);
    } catch (e) {
      console.error(e);
      alert('AI生成中にエラーが発生しました');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(markdown);
    setCopyStatus('copied');
    setTimeout(() => setCopyStatus('idle'), 2000);
  };

  const downloadAsFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareToObsidian = async (content: string, filename: string, folderPath?: string) => {
    // Check if Web Share API is available (iOS Safari supports this)
    if (navigator.share && navigator.canShare) {
      try {
        const blob = new Blob([content], { type: 'text/markdown' });
        const file = new File([blob], filename, { type: 'text/markdown' });
        
        // Try to share the file
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: filename,
            text: folderPath ? `Obsidianフォルダ「${folderPath}」に保存してください` : '筋トレログをObsidianで開く'
          });
          return true;
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Share error:', err);
        }
        return false;
      }
    }
    return false;
  };

  const openInObsidianWithContent = async (content: string, filename: string, folderPath?: string) => {
    // Try Obsidian URL scheme with content
    // Format: obsidian://new?vault=VaultName&file=path/to/file.md&content=...
    // Note: Content needs to be URL encoded
    // Important: When vault is specified, file path must be relative to vault root (without leading slash)
    
    let vaultName = '';
    let relativePath = '';
    
    if (folderPath) {
      const parts = folderPath.split('/').filter(p => p.trim() !== '');
      
      // Find vault name (part that contains "Obsidian")
      // Handle both short paths (ObsidianNotes/04_Journals/筋トレ日記) 
      // and full paths (/Users/.../ObsidianNotes/04_Journals/筋トレ日記)
      let vaultIndex = -1;
      for (let i = 0; i < parts.length; i++) {
        if (parts[i].includes('Obsidian')) {
          vaultIndex = i;
          vaultName = parts[i];
          break;
        }
      }
      
      if (vaultIndex >= 0) {
        // Get relative path within vault (everything after vault name)
        // Example: ObsidianNotes/04_Journals/筋トレ日記 -> relativePath = "04_Journals/筋トレ日記"
        // Example: /Users/.../ObsidianNotes/04_Journals/筋トレ日記 -> relativePath = "04_Journals/筋トレ日記"
        if (vaultIndex < parts.length - 1) {
          relativePath = parts.slice(vaultIndex + 1).join('/');
        }
      } else {
        // If no vault name detected, check if path starts with common Obsidian patterns
        // For paths like "04_Journals/筋トレ日記", assume it's relative to vault root
        relativePath = folderPath;
      }
    }
    
    // Construct file path: relative path + filename (with .md extension)
    // Example: "04_Journals/筋トレ日記/2026-02-01.md"
    const filePath = relativePath 
      ? `${relativePath}/${filename}`
      : filename;
    
    // URL encode the content (limit to reasonable size for URL)
    const encodedContent = encodeURIComponent(content.substring(0, 10000)); // Limit to avoid URL length issues
    
    // Build Obsidian URL: file path should be relative to vault root
    // Note: obsidian://new creates a new file, but may create folders if they don't exist
    // Using the full path including all folders ensures correct location
    let obsidianUrl = `obsidian://new?file=${encodeURIComponent(filePath)}&content=${encodedContent}`;
    
    if (vaultName) {
      obsidianUrl += `&vault=${encodeURIComponent(vaultName)}`;
    }
    
    // Enhanced debugging
    console.log('=== Obsidian URL Scheme Debug ===');
    console.log('Full folder path:', folderPath);
    console.log('Parts:', folderPath?.split('/').filter(p => p.trim() !== ''));
    console.log('Vault index:', folderPath?.split('/').findIndex(p => p.includes('Obsidian')));
    console.log('Vault name:', vaultName);
    console.log('Relative path:', relativePath);
    console.log('File path:', filePath);
    console.log('Obsidian URL:', obsidianUrl);
    console.log('================================');
    
    // Try to open Obsidian
    try {
      window.location.href = obsidianUrl;
      // Wait a bit to see if Obsidian opens
      await new Promise(resolve => setTimeout(resolve, 1500));
      return true;
    } catch (err) {
      console.error('Obsidian URL scheme error:', err);
      return false;
    }
  };

  const handleSelectFolder = async () => {
    return new Promise<void>((resolve) => {
      try {
        // Check if File System Access API is available (desktop)
        if (typeof window !== 'undefined' && 'showDirectoryPicker' in window) {
          (window as any).showDirectoryPicker().then(async (handle: any) => {
            await storeDirectoryHandle(handle);
            setDirHandle(handle);
            resolve();
          }).catch((e: any) => {
            if (e.name !== 'AbortError') {
              console.error('Folder selection error:', e);
            }
            resolve();
          });
        } else {
          // Mobile: use webkitdirectory input
          const input = document.createElement('input');
          input.type = 'file';
          input.setAttribute('webkitdirectory', '');
          input.setAttribute('directory', '');
          input.style.display = 'none';
          input.style.position = 'absolute';
          input.style.left = '-9999px';
          document.body.appendChild(input);
          
          let resolved = false;
          
          const handleChange = async (e: Event) => {
            if (resolved) return;
            resolved = true;
            
            const target = e.target as HTMLInputElement;
            const files = target.files;
            console.log('Files selected:', files?.length);
            
            if (files && files.length > 0) {
              // Get the directory name from the first file
              const firstFile = files[0];
              console.log('First file:', firstFile.name, firstFile.webkitRelativePath);
              
              let directoryName = '選択したフォルダ';
              if (firstFile.webkitRelativePath) {
                directoryName = firstFile.webkitRelativePath.split('/')[0];
              } else if (firstFile.name) {
                // Fallback: use a generic name
                directoryName = '選択したフォルダ';
              }
              
              // Create a mock handle object for mobile
              const mockHandle = {
                name: directoryName,
                files: Array.from(files),
                isMobile: true,
                directoryPath: firstFile.webkitRelativePath ? firstFile.webkitRelativePath.substring(0, firstFile.webkitRelativePath.indexOf('/')) : ''
              };
              
              console.log('Setting dirHandle:', mockHandle);
              
              // Store in localStorage first
              try {
                localStorage.setItem('ironlog_mobile_folder', JSON.stringify({
                  name: directoryName,
                  timestamp: Date.now()
                }));
              } catch (err) {
                console.error('localStorage error:', err);
              }
              
              // Set state and force update
              setDirHandle(mockHandle);
              setForceUpdate(prev => prev + 1);
              
              console.log('State update triggered, forceUpdate:', forceUpdate + 1);
              
              // Force a small delay to ensure state update
              setTimeout(() => {
                console.log('State should be updated now');
              }, 100);
            } else {
              console.log('No files selected');
            }
            
            setTimeout(() => {
              if (document.body.contains(input)) {
                document.body.removeChild(input);
              }
            }, 200);
            resolve();
          };
          
          const handleCancel = () => {
            if (resolved) return;
            resolved = true;
            console.log('Folder selection cancelled - iOS fallback');
            
            // Clean up input first
            setTimeout(() => {
              if (document.body.contains(input)) {
                document.body.removeChild(input);
              }
            }, 100);
            
            // iOS fallback: if cancelled (webkitdirectory doesn't work), offer manual folder name input
            // Use setTimeout to ensure prompt appears after file picker closes
            setTimeout(() => {
              const userInput = prompt('Obsidianのフォルダパスを入力してください:\n\n例:\n- ObsidianNotes/04_Journals/筋トレ日記\n- Journals/筋トレログ\n\n💡 このパスを入力すると、Obsidianアプリで直接開けるようになります！');
              if (userInput && userInput.trim()) {
                const mockHandle = {
                  name: userInput.trim(),
                  files: [],
                  isMobile: true,
                  directoryPath: ''
                };
                
                console.log('Setting dirHandle from manual input:', mockHandle);
                
                // Store in localStorage first
                try {
                  localStorage.setItem('ironlog_mobile_folder', JSON.stringify({
                    name: userInput.trim(),
                    timestamp: Date.now()
                  }));
                  console.log('Stored in localStorage:', userInput.trim());
                } catch (err) {
                  console.error('localStorage error:', err);
                }
                
                // Set state - use callback form to ensure update
                setDirHandle(() => {
                  console.log('State update callback called with:', mockHandle);
                  return mockHandle;
                });
                
                // Force re-render
                setForceUpdate(prev => {
                  console.log('Force update triggered:', prev + 1);
                  return prev + 1;
                });
                
                // Verify after a delay
                setTimeout(() => {
                  const stored = localStorage.getItem('ironlog_mobile_folder');
                  console.log('Verification - localStorage:', stored);
                }, 200);
              } else {
                console.log('User cancelled folder name input');
              }
              resolve();
            }, 500);
          };
          
          input.addEventListener('change', handleChange, { once: true });
          input.addEventListener('cancel', handleCancel, { once: true });
          
          // Trigger click with a small delay
          setTimeout(() => {
            try {
              input.click();
            } catch (err) {
              console.error('Click error:', err);
              // Fallback to manual input
              const userInput = prompt('フォルダ名を入力してください（保存先として表示されます）:\n例: 筋トレログ、Documents など');
              if (userInput && userInput.trim()) {
                const mockHandle = {
                  name: userInput.trim(),
                  files: [],
                  isMobile: true,
                  directoryPath: ''
                };
                setDirHandle(mockHandle);
                try {
                  localStorage.setItem('ironlog_mobile_folder', JSON.stringify({
                    name: userInput.trim(),
                    timestamp: Date.now()
                  }));
                } catch (e) {
                  // Ignore
                }
              }
              if (document.body.contains(input)) {
                document.body.removeChild(input);
              }
              resolve();
            }
          }, 100);
        }
      } catch (e: any) {
        console.error('Folder selection error:', e);
        resolve();
      }
    });
  };

  const handleSaveToFolder = async () => {
    if (!markdown) return;
    setIsSaving(true);
    
    // Generate filename based on output format
    const dateStr = selectedDate || new Date().toISOString().split('T')[0];
    const filename = outputFormat === 'markdown' 
      ? `${dateStr}.md` // Obsidian日記形式
      : `instagram-caption-${dateStr}.txt`; // Instagramキャプション形式
    
    try {
      let handle = dirHandle;

      // If no handle, try to get one
      if (!handle) {
        await handleSelectFolder();
        handle = dirHandle;
        if (!handle) {
          // User cancelled or error
          setIsSaving(false);
          return;
        }
      }

      // Check if mobile handle (using webkitdirectory)
      if (handle.isMobile) {
        const folderPath = handle.name;
        const isObsidianPath = folderPath.includes('Obsidian') || folderPath.includes('obsidian') || folderPath.includes('Journals') || folderPath.includes('筋トレ');
        
        // 手動入力モードの場合は、Obsidian URLスキームを使わずにダウンロードのみ
        if (folderInputMode === 'manual') {
          downloadAsFile(markdown, filename);
          
          if (isObsidianPath) {
            alert(`ダウンロード完了！\nファイル名: ${filename}\n\n📱 Obsidianで開く方法:\n1. ダウンロードしたファイルを長押し\n2. 「共有」→「Obsidian」を選択\n3. 保存先フォルダ「${folderPath}」を選択\n\n💡 手動でObsidianにインポートしてください。`);
          } else {
            alert(`ダウンロード完了！\nファイル名: ${filename}\n\n選択したフォルダ「${handle.name}」に手動で移動してください。`);
          }
          setIsSaving(false);
          return;
        }
        
        // 自動保存モードの場合のみObsidian URLスキームを試行
        if (folderInputMode === 'auto' && isObsidianPath) {
          // Try Obsidian URL scheme first (most direct method)
          const opened = await openInObsidianWithContent(markdown, filename, folderPath);
          if (opened) {
            alert(`Obsidianアプリを開きました！\n\nファイル名: ${filename}\n保存先: ${folderPath}\n\nObsidianで保存を確認してください。`);
            setIsSaving(false);
            return;
          }
          
          // Try Web Share API as fallback
          if (navigator.share) {
            const shared = await shareToObsidian(markdown, filename, folderPath);
            if (shared) {
              alert(`Obsidianアプリでファイルを開きました！\n\nファイル名: ${filename}\n保存先フォルダ「${folderPath}」を選択してください。`);
              setIsSaving(false);
              return;
            }
          }
        }
        
        // Final fallback: download file
        downloadAsFile(markdown, filename);
        
        if (isObsidianPath) {
          alert(`ダウンロード完了！\nファイル名: ${filename}\n\n📱 Obsidianで開く最速の方法:\n1. ダウンロードしたファイルを長押し\n2. 「共有」→「Obsidian」を選択\n3. 保存先フォルダ「${folderPath}」を選択\n\n💡 次回からは「📤 共有/保存」ボタンで直接Obsidianに共有できます！`);
        } else {
          alert(`ダウンロード完了！\nファイル名: ${filename}\n\n選択したフォルダ「${handle.name}」に手動で移動してください。`);
        }
        setIsSaving(false);
        return;
      }

      // Desktop: use File System Access API
      if (typeof window !== 'undefined' && 'showDirectoryPicker' in window) {
        // Verify permission
        const opts = { mode: 'readwrite' as const };
        try {
          const permission = await handle.queryPermission(opts);
          if (permission !== 'granted') {
            const newPermission = await handle.requestPermission(opts);
            if (newPermission !== 'granted') {
              downloadAsFile(markdown, filename);
              setIsSaving(false);
              return;
            }
          }
        } catch (e) {
          downloadAsFile(markdown, filename);
          setIsSaving(false);
          return;
        }

        // Save to folder
        const fileHandle = await handle.getFileHandle(filename, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(markdown);
        await writable.close();
        alert(`保存完了！\n場所: ${handle.name}/${filename}`);
      } else {
        // Fallback to download
        downloadAsFile(markdown, filename);
      }

    } catch (e: any) {
      // Always fallback to download on any error
      downloadAsFile(markdown, filename);
      console.error('Save error:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const exportData = () => {
    const data = {
      sessions,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `muscle-diary-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('データをエクスポートしました！');
  };

  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          if (data.sessions && Array.isArray(data.sessions)) {
            if (confirm(`データをインポートしますか？\n既存のデータは上書きされます。\nセッション数: ${data.sessions.length}件`)) {
              // App.tsxで処理するため、親コンポーネントに通知する必要がある
              // ここではlocalStorageに直接保存
              localStorage.setItem('ironlog_sessions', JSON.stringify(data.sessions));
              alert('データをインポートしました！ページをリロードしてください。');
              window.location.reload();
            }
          } else {
            alert('無効なデータ形式です。');
          }
        } catch (error) {
          console.error('Import error:', error);
          alert('データの読み込みに失敗しました。');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="space-y-6 pb-20">
      {/* データバックアップ/復元 */}
      <div className="bg-gradient-to-r from-emerald-900 to-slate-900 p-6 rounded-xl border border-emerald-500/30">
        <h2 className="text-xl font-bold text-white mb-2">📦 データバックアップ</h2>
        <p className="text-slate-300 text-sm mb-4">
          データをエクスポート/インポートして、バックアップや別デバイスへの移行ができます。
        </p>
        <div className="flex gap-3 flex-wrap">
          <Button 
            onClick={exportData}
            className="bg-emerald-600 hover:bg-emerald-500"
          >
            💾 データをエクスポート
          </Button>
          <Button 
            onClick={importData}
            variant="secondary"
          >
            📥 データをインポート
          </Button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 p-6 rounded-xl border border-indigo-500/30">
        <h2 className="text-xl font-bold text-white mb-2">Gemini AI Export</h2>
        <p className="text-slate-300 text-sm mb-4">
          Google Gemini AIを使用して、トレーニング履歴を魅力的なブログ形式のMarkdownに変換します。
        </p>
        
        {/* Date Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            📅 出力する日付を選択
          </label>
          <select
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setMarkdown(''); // Clear markdown when date changes
            }}
            className="w-full bg-slate-800 text-white border border-slate-600 rounded-lg px-4 py-2 focus:border-indigo-500 focus:outline-none"
          >
            <option value="">全セッション</option>
            {availableDates.map(date => {
              const dateObj = new Date(date);
              const dateLabel = dateObj.toLocaleDateString('ja-JP', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'short'
              });
              const sessionCount = sessions.filter(s => s.date === date).length;
              return (
                <option key={date} value={date}>
                  {dateLabel} ({sessionCount}件)
                </option>
              );
            })}
          </select>
          {selectedDate && selectedSessions.length > 0 && (
            <p className="text-xs text-slate-400 mt-2">
              {selectedSessions.length}件のセッションが選択されています
            </p>
          )}
        </div>

        {/* 出力形式選択 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            📝 出力形式を選択
          </label>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="outputFormat"
                value="markdown"
                checked={outputFormat === 'markdown'}
                onChange={(e) => {
                  setOutputFormat(e.target.value as 'markdown' | 'instagram');
                  setMarkdown(''); // Clear markdown when format changes
                }}
                className="w-4 h-4 text-indigo-600"
              />
              <span className="text-xs text-slate-300">📄 Markdown</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="outputFormat"
                value="instagram"
                checked={outputFormat === 'instagram'}
                onChange={(e) => {
                  setOutputFormat(e.target.value as 'markdown' | 'instagram');
                  setMarkdown(''); // Clear markdown when format changes
                }}
                className="w-4 h-4 text-indigo-600"
              />
              <span className="text-xs text-slate-300">📱 Instagram</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          {outputFormat === 'markdown' ? (
            <>
              <Button 
                onClick={handleAiGenerate} 
                isLoading={isGenerating}
                disabled={sessions.length === 0 || (selectedDate && selectedSessions.length === 0)}
                className="bg-indigo-600 hover:bg-indigo-500"
              >
                ✨ AIで要約を作成
              </Button>
              <Button 
                onClick={generateSimpleMarkdown} 
                variant="secondary"
                disabled={sessions.length === 0 || (selectedDate && selectedSessions.length === 0)}
              >
                シンプル出力
              </Button>
            </>
          ) : (
            <Button 
              onClick={generateInstagramCaption} 
              isLoading={isGenerating}
              disabled={sessions.length === 0 || (selectedDate && selectedSessions.length === 0)}
              className="bg-pink-600 hover:bg-pink-500"
            >
              📱 Instagramキャプション生成
            </Button>
          )}
        </div>
      </div>

      {markdown && (
        <div className="animate-fadeIn space-y-4">
          <div className="bg-card p-4 rounded-xl border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-4">出力オプション</h3>
            
            <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                    <Button 
                        onClick={copyToClipboard}
                        variant="secondary"
                        className="flex-1"
                    >
                        {copyStatus === 'copied' ? '✅ コピー済み' : '📋 コピー'}
                    </Button>
                    <Button
                        onClick={handleSaveToFolder}
                        variant="primary"
                        isLoading={isSaving}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/30"
                    >
                        {isFsaSupported ? '💾 保存する' : navigator.share ? '📤 共有/保存' : '⬇️ ダウンロード'}
                    </Button>
                </div>

                {isFsaSupported ? (
                    <div className="space-y-3">
                        {/* フォルダ入力モード選択 */}
                        <div className="bg-slate-800/50 p-3 rounded border border-slate-700">
                            <label className="block text-xs font-medium text-slate-300 mb-2">
                                保存方法を選択
                            </label>
                            <div className="flex gap-3">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="folderMode"
                                        value="manual"
                                        checked={folderInputMode === 'manual'}
                                        onChange={(e) => setFolderInputMode(e.target.value as 'manual' | 'auto')}
                                        className="w-4 h-4 text-emerald-600"
                                    />
                                    <span className="text-xs text-slate-300">📥 手動入力（ダウンロードのみ）</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="folderMode"
                                        value="auto"
                                        checked={folderInputMode === 'auto'}
                                        onChange={(e) => setFolderInputMode(e.target.value as 'manual' | 'auto')}
                                        className="w-4 h-4 text-emerald-600"
                                    />
                                    <span className="text-xs text-slate-300">🚀 自動保存（Obsidian直接）</span>
                                </label>
                            </div>
                            <p className="text-xs text-slate-400 mt-2">
                                {folderInputMode === 'manual' 
                                    ? '📥 手動入力: ファイルをダウンロード後、手動でObsidianにインポートします（推奨・既存フォルダに確実に保存可能）'
                                    : '🚀 自動保存: Obsidianアプリを直接開いて保存します（フォルダが正しく認識されない場合があります）'}
                            </p>
                            {folderInputMode === 'auto' && (
                                <p className="text-xs text-yellow-400 mt-1">
                                    ⚠️ 自動保存モードでは、フォルダパスが正しく認識されない場合があります。既存フォルダに確実に保存したい場合は「手動入力」モードをご利用ください。
                                </p>
                            )}
                        </div>

                        {/* フォルダ選択 */}
                        {!dirHandle ? (
                            <div className="bg-slate-800/50 p-3 rounded border border-dashed border-slate-600 flex items-center justify-between">
                                <span className="text-xs text-slate-400">
                                    📂 保存先フォルダ: 未設定
                                </span>
                                <button 
                                    onClick={async () => {
                                      console.log('Folder select button clicked');
                                      
                                      // 直接手動入力を促す（フォルダ選択ではなく）
                                      const userInput = prompt('Obsidianのフォルダパスを入力してください:\n\n例:\n- ObsidianNotes/04_Journals/筋トレ日記\n- Journals/筋トレログ\n\n💡 完全なパスを入力してください（ObsidianNotes/04_Journals/筋トレ日記）');
                                      
                                      if (userInput && userInput.trim()) {
                                        const mockHandle = {
                                          name: userInput.trim(),
                                          files: [],
                                          isMobile: true,
                                          directoryPath: ''
                                        };
                                        
                                        console.log('Setting dirHandle from manual input:', mockHandle);
                                        
                                        // Store in localStorage
                                        try {
                                          localStorage.setItem('ironlog_mobile_folder', JSON.stringify({
                                            name: userInput.trim(),
                                            timestamp: Date.now()
                                          }));
                                          console.log('Stored in localStorage:', userInput.trim());
                                        } catch (err) {
                                          console.error('localStorage error:', err);
                                        }
                                        
                                        // Set state
                                        setDirHandle(mockHandle);
                                        setForceUpdate(prev => prev + 1);
                                      }
                                    }}
                                    className="text-xs text-primary hover:text-blue-300 underline"
                                >
                                    フォルダパスを入力...
                                </button>
                            </div>
                        ) : (
                            <div className="mt-2 text-xs flex items-center justify-between bg-slate-800 p-2 rounded border border-slate-700">
                                <span className="text-slate-400 truncate mr-2">
                                    保存先: <span className="text-emerald-400 font-mono">📂 {dirHandle?.name || '選択したフォルダ'}</span>
                                </span>
                                <button 
                                    onClick={() => {
                                      setDirHandle(null);
                                      try {
                                        localStorage.removeItem('ironlog_mobile_folder');
                                      } catch (e) {
                                        // Ignore
                                      }
                                      setForceUpdate(prev => prev + 1);
                                    }}
                                    className="text-slate-500 hover:text-white underline shrink-0"
                                >
                                    変更
                                </button>
                            </div>
                        )}
                    </div>
                ) : null}
            </div>
          </div>

          <div>
             <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-400">プレビュー</span>
            </div>
            <textarea
                className="w-full h-96 bg-dark text-slate-300 p-4 rounded-xl border border-slate-700 font-mono text-sm focus:border-primary outline-none resize-none"
                value={markdown}
                readOnly
            />
          </div>
        </div>
      )}
    </div>
  );
};