import React, { useRef, useState } from 'react';
import { WorkoutSession } from '../types';
import { Button } from './ui/Button';

interface ShareImageProps {
  session: WorkoutSession;
  onClose: () => void;
}

export const ShareImage: React.FC<ShareImageProps> = ({ session, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(null);

  // Instagram推奨サイズ: 4:5の比率 1080x1350px
  const CANVAS_WIDTH = 1080;
  const CANVAS_HEIGHT = 1350;
  const BACKGROUND_OPACITY = 0.5; // 背景画像の透明度（文字が見やすいように）

  const handleBackgroundImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 画像ファイルかチェック
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setBackgroundImageUrl(dataUrl);
      
      // Imageオブジェクトを作成して読み込み
      const img = new Image();
      img.onload = () => {
        setBackgroundImage(img);
        // 画像が読み込まれたら再生成
        setTimeout(() => generateImage(), 100);
      };
      img.onerror = () => {
        alert('画像の読み込みに失敗しました');
      };
      img.src = dataUrl;
    };
    reader.onerror = () => {
      alert('ファイルの読み込みに失敗しました');
    };
    reader.readAsDataURL(file);
  };

  const removeBackgroundImage = () => {
    setBackgroundImage(null);
    setBackgroundImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // 背景画像を削除したら再生成
    setTimeout(() => generateImage(), 100);
  };

  const generateImage = async () => {
    setIsGenerating(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // フォントの読み込みを待つ
    await document.fonts.ready;

    // キャンバスサイズ設定
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    // 背景の描画
    if (backgroundImage) {
      // 背景画像を描画（透明度を適用）
      ctx.save();
      ctx.globalAlpha = BACKGROUND_OPACITY;
      
      // 画像をキャンバスサイズに合わせて描画（アスペクト比を維持して中央配置）
      const imgAspect = backgroundImage.width / backgroundImage.height;
      const canvasAspect = CANVAS_WIDTH / CANVAS_HEIGHT;
      
      let drawWidth = CANVAS_WIDTH;
      let drawHeight = CANVAS_HEIGHT;
      let offsetX = 0;
      let offsetY = 0;
      
      if (imgAspect > canvasAspect) {
        // 画像の方が横長の場合、高さに合わせる
        drawHeight = CANVAS_HEIGHT;
        drawWidth = drawHeight * imgAspect;
        offsetX = (CANVAS_WIDTH - drawWidth) / 2;
      } else {
        // 画像の方が縦長の場合、幅に合わせる
        drawWidth = CANVAS_WIDTH;
        drawHeight = drawWidth / imgAspect;
        offsetY = (CANVAS_HEIGHT - drawHeight) / 2;
      }
      
      ctx.drawImage(backgroundImage, offsetX, offsetY, drawWidth, drawHeight);
      ctx.restore();
      
      // 背景画像の上に半透明の黒いレイヤーを重ねて文字を見やすくする
      ctx.fillStyle = 'rgba(15, 23, 42, 0.4)'; // 暗いオーバーレイ（透明度を下げて背景をもっと見えるように）
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    } else {
      // 背景画像がない場合はグラデーションを使用
      const gradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      gradient.addColorStop(0, '#0f172a'); // dark
      gradient.addColorStop(1, '#1e293b'); // card
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    // 装飾的な円形
    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH - 100, 100, 200, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(59, 130, 246, 0.1)'; // blue-500 with opacity
    ctx.fill();

    ctx.beginPath();
    ctx.arc(100, CANVAS_HEIGHT - 100, 150, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(16, 185, 129, 0.1)'; // emerald-500 with opacity
    ctx.fill();

    // タイトル
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 80px "Inter", "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Meiryo", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Muscle diary', CANVAS_WIDTH / 2, 140);

    // 日付
    ctx.fillStyle = '#94a3b8';
    ctx.font = '52px "Inter", "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Meiryo", sans-serif';
    const dateText = new Date(session.date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
    ctx.fillText(dateText, CANVAS_WIDTH / 2, 220);

    // 部位タグ
    if (session.tags.length > 0) {
      const tagY = 300;
      ctx.fillStyle = '#3b82f6';
      ctx.font = 'bold 40px "Inter", "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Meiryo", sans-serif';
      const tagsText = session.tags.join(' • ');
      ctx.fillText(tagsText, CANVAS_WIDTH / 2, tagY);
    }

    // セッション時間
    if (session.duration) {
      ctx.fillStyle = '#10b981';
      ctx.font = '36px "Inter", "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Meiryo", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`⏱️ ${session.duration}分`, CANVAS_WIDTH - 60, 380);
      ctx.textAlign = 'center';
    }

    // 種目リスト（動的サイズ調整）
    const statsBoxTop = CANVAS_HEIGHT - 200; // 統計ボックスの上端
    const availableHeight = statsBoxTop - 480; // 利用可能な高さ
    const totalExercises = session.exercises.length;
    
    const leftMargin = 100;
    const rightMargin = 100;
    const availableWidth = CANVAS_WIDTH - leftMargin - rightMargin;
    const setSpacing = 12; // セット間の横方向の間隔
    
    // 初期フォントサイズ（種目名をセット数より大きく）
    let exerciseNameFontSize = 60; // 種目名を大きく
    let setFontSize = 26; // セット情報のフォントサイズ（種目名より小さく）
    let exerciseSpacing = 25; // 種目間の間隔（セット情報と次の種目の間を広げる）
    let setLineHeight = 42; // セット行の高さ
    const nameToSetSpacing = 15; // 種目名とセット情報の間隔（狭くする）
    
    // 必要な高さを正確に計算する関数
    const calculateRequiredHeight = (nameSize: number, setSize: number, lineHeight: number, spacing: number): number => {
      let totalHeight = 0;
      
      session.exercises.forEach((exercise) => {
        // セット情報の行数を計算
        let setsRows = 1;
        let lineWidth = 0;
        
        // 仮のコンテキストで幅を測定
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return totalHeight;
        
        tempCtx.font = `${setSize}px "Inter", "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Meiryo", sans-serif`;
        
        exercise.sets.forEach((set, setIndex) => {
          const weightText = set.isBodyweight ? '自重' : `${set.weight}kg`;
          const setText = `${set.reps}reps`;
          const setInfo = `${setIndex + 1}セット目: ${weightText} × ${setText}`;
          
          const setWidth = tempCtx.measureText(setInfo).width;
          const totalSetWidth = setWidth + setSpacing;
          
          if (lineWidth + totalSetWidth > availableWidth && lineWidth > 0) {
            setsRows++;
            lineWidth = 0;
          }
          lineWidth += totalSetWidth;
        });
        
        totalHeight += nameSize + 15 + (setsRows * lineHeight) + spacing; // 種目名とセット情報の間隔を15pxに固定
      });
      
      return totalHeight;
    };
    
    // 必要な高さを計算
    let requiredHeight = calculateRequiredHeight(exerciseNameFontSize, setFontSize, setLineHeight, exerciseSpacing);
    
    // 必要な高さが利用可能な高さを超える場合、全体を縮小
    if (requiredHeight > availableHeight) {
      const scaleFactor = (availableHeight * 0.98) / requiredHeight; // 98%の余裕を持たせる
      exerciseNameFontSize = Math.floor(exerciseNameFontSize * scaleFactor);
      setFontSize = Math.floor(setFontSize * scaleFactor);
      setLineHeight = Math.floor(setLineHeight * scaleFactor);
      exerciseSpacing = Math.floor(exerciseSpacing * scaleFactor);
      
      // 種目名がセット数より大きいことを保証（最小でも1.5倍）
      const minExerciseNameSize = Math.ceil(setFontSize * 1.5);
      if (exerciseNameFontSize < minExerciseNameSize) {
        // 種目名のサイズを保証し、セットサイズを調整
        exerciseNameFontSize = minExerciseNameSize;
        // 再計算して適切なサイズを求める
        requiredHeight = calculateRequiredHeight(exerciseNameFontSize, setFontSize, setLineHeight, exerciseSpacing);
        if (requiredHeight > availableHeight) {
          const adjustedScale = (availableHeight * 0.98) / requiredHeight;
          setFontSize = Math.floor(setFontSize * adjustedScale);
          setLineHeight = Math.floor(setLineHeight * adjustedScale);
          exerciseSpacing = Math.floor(exerciseSpacing * adjustedScale);
        }
      }
    }
    
    // 種目数が多い場合の追加縮小
    if (totalExercises > 5) {
      const extraScale = Math.max(0.85, 1 - (totalExercises - 5) * 0.05);
      exerciseNameFontSize = Math.floor(exerciseNameFontSize * extraScale);
      setFontSize = Math.floor(setFontSize * extraScale);
      setLineHeight = Math.floor(setLineHeight * extraScale);
      
      // 再度高さを確認
      requiredHeight = calculateRequiredHeight(exerciseNameFontSize, setFontSize, setLineHeight, exerciseSpacing);
      if (requiredHeight > availableHeight) {
        const finalScale = (availableHeight * 0.98) / requiredHeight;
        exerciseNameFontSize = Math.floor(exerciseNameFontSize * finalScale);
        setFontSize = Math.floor(setFontSize * finalScale);
        setLineHeight = Math.floor(setLineHeight * finalScale);
        exerciseSpacing = Math.floor(exerciseSpacing * finalScale);
        
        // 種目名がセット数より大きいことを保証
        const minExerciseNameSize = Math.ceil(setFontSize * 1.5);
        if (exerciseNameFontSize < minExerciseNameSize) {
          exerciseNameFontSize = minExerciseNameSize;
        }
      }
    }

    let yPos = 480;

    session.exercises.forEach((exercise, index) => {
      // 種目名（大きく表示）
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${exerciseNameFontSize}px "Inter", "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Meiryo", sans-serif`;
      ctx.textAlign = 'left';
      
      // 種目名が長い場合は縮小（ただし最小サイズを保つ）
      let nameFontSize = exerciseNameFontSize;
      ctx.font = `bold ${nameFontSize}px "Inter", "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Meiryo", sans-serif`;
      let nameWidth = ctx.measureText(exercise.name).width;
      if (nameWidth > availableWidth) {
        nameFontSize = Math.max(exerciseNameFontSize * 0.7, Math.floor(nameFontSize * (availableWidth / nameWidth)));
        ctx.font = `bold ${nameFontSize}px "Inter", "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Meiryo", sans-serif`;
      }
      ctx.fillText(exercise.name, leftMargin, yPos);

      // セット情報を横並びで表示（2行目に折り返し）
      ctx.fillStyle = '#64748b';
      ctx.font = `${setFontSize}px "Inter", "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Meiryo", sans-serif`;
      ctx.textAlign = 'left';
      
      let currentX = leftMargin;
      let currentY = yPos + nameFontSize + nameToSetSpacing; // 種目名とセット情報の間隔を狭く
      let lineWidth = 0;
      const maxLineWidth = availableWidth;
      let setsRows = 1; // セット情報の行数を追跡
      
      exercise.sets.forEach((set, setIndex) => {
        const weightText = set.isBodyweight ? '自重' : `${set.weight}kg`;
        const setText = `${set.reps}reps`;
        const setInfo = `${setIndex + 1}セット目: ${weightText} × ${setText}`;
        
        // セット情報の幅を測定
        ctx.font = `${setFontSize}px "Inter", "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Meiryo", sans-serif`;
        const setWidth = ctx.measureText(setInfo).width;
        const totalSetWidth = setWidth + setSpacing;
        
        // 現在の行に収まるかチェック
        if (lineWidth + totalSetWidth > maxLineWidth && lineWidth > 0) {
          // 次の行に移動
          currentY += setLineHeight;
          currentX = leftMargin;
          lineWidth = 0;
          setsRows++;
        }
        
        // セット情報を描画
        ctx.fillText(setInfo, currentX, currentY);
        
        // 次のセットの位置を更新
        currentX += totalSetWidth;
        lineWidth += totalSetWidth;
      });

      // 次の種目の開始位置を計算（セット情報の行数を考慮）
      const setsHeight = setsRows * setLineHeight;
      yPos += nameFontSize + nameToSetSpacing + setsHeight + exerciseSpacing; // 種目名とセット情報の間隔を狭く、種目間の間隔を広げる

      // 区切り線
      if (index < session.exercises.length - 1) {
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(leftMargin, yPos - exerciseSpacing / 2);
        ctx.lineTo(CANVAS_WIDTH - rightMargin, yPos - exerciseSpacing / 2);
        ctx.stroke();
      }
    });
    
    // 最終的な位置を確認して、統計ボックスと重ならないように調整
    if (yPos > statsBoxTop - 30) {
      // 全体をさらに縮小
      const overflow = yPos - (statsBoxTop - 30);
      const scaleFactor = (statsBoxTop - 30 - 480) / (yPos - 480);
      exerciseNameFontSize = Math.floor(exerciseNameFontSize * scaleFactor);
      setFontSize = Math.floor(setFontSize * scaleFactor);
      setLineHeight = Math.floor(setLineHeight * scaleFactor);
      exerciseSpacing = Math.floor(exerciseSpacing * scaleFactor);
      
      // 再描画が必要な場合は、ここで再帰的に呼び出すか、全体を再計算
      // 今回は簡略化のため、最初から適切なサイズで描画する
    }

    // 総Volume計算
    const totalVolume = session.exercises.reduce((total, ex) => {
      return total + ex.sets.reduce((exTotal, set) => {
        if (set.isBodyweight) return exTotal;
        return exTotal + (set.weight * set.reps);
      }, 0);
    }, 0);

    // 統計情報ボックス
    const statsY = CANVAS_HEIGHT - 200;
    ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
    ctx.fillRect(100, statsY, CANVAS_WIDTH - 200, 140);

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 40px "Inter", "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Meiryo", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`総Volume: ${totalVolume.toLocaleString()}kg`, 140, statsY + 50);

    ctx.fillStyle = '#3b82f6';
    ctx.fillText(`${session.exercises.length}種目`, 140, statsY + 100);

    // フッター
    ctx.fillStyle = '#64748b';
    ctx.font = '28px "Inter", "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Meiryo", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Muscle diary で記録', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 40);

    // 画像URLを生成
    const url = canvas.toDataURL('image/png');
    setImageUrl(url);
    setIsGenerating(false);
  };

  const downloadImage = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.download = `muscle-diary-${session.date}.png`;
    link.href = imageUrl;
    link.click();
  };

  const copyToClipboard = async () => {
    if (!canvasRef.current || !imageUrl) return;
    
    try {
      const blob = await fetch(imageUrl).then(r => r.blob());
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      alert('画像をクリップボードにコピーしました！');
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('クリップボードへのコピーに失敗しました。ダウンロード機能をご利用ください。');
    }
  };

  // 初回レンダリング時または背景画像変更時に画像生成
  React.useEffect(() => {
    generateImage();
  }, [backgroundImage]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-card border border-slate-700 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">シェア画像生成</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* 背景画像選択 */}
          <div className="mb-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              🖼️ 背景画像を選択（オプション）
            </label>
            <div className="flex gap-3 items-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleBackgroundImageSelect}
                className="hidden"
                id="background-image-input"
              />
              <label
                htmlFor="background-image-input"
                className="flex-1 cursor-pointer"
              >
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={(e) => {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }}
                >
                  📷 画像を選択
                </Button>
              </label>
              {backgroundImageUrl && (
                <>
                  <div className="flex-1 relative">
                    <img
                      src={backgroundImageUrl}
                      alt="背景プレビュー"
                      className="w-full h-20 object-cover rounded-lg opacity-60"
                    />
                    <button
                      onClick={removeBackgroundImage}
                      className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      title="背景画像を削除"
                    >
                      ✕
                    </button>
                  </div>
                </>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              背景画像は自動的に透明度が調整され、文字が見やすくなります
            </p>
          </div>

          {isGenerating ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-slate-400">画像を生成中...</div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* プレビュー */}
              <div className="bg-dark rounded-lg p-4 flex justify-center">
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt="Share image"
                    className="max-w-full h-auto rounded-lg"
                  />
                )}
              </div>

              {/* 非表示のCanvas */}
              <canvas ref={canvasRef} style={{ display: 'none' }} />

              {/* アクションボタン */}
              <div className="flex gap-3">
                <Button
                  onClick={downloadImage}
                  className="flex-1"
                >
                  📥 ダウンロード
                </Button>
                <Button
                  onClick={copyToClipboard}
                  variant="secondary"
                  className="flex-1"
                >
                  📋 コピー
                </Button>
                <Button
                  onClick={generateImage}
                  variant="ghost"
                  className="flex-1"
                >
                  🔄 再生成
                </Button>
              </div>

              {/* Instagram投稿のヒント */}
              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                <div className="text-sm text-slate-300 space-y-2">
                  <div className="font-bold text-white mb-2">📱 Instagram投稿のヒント</div>
                  <div>• 画像サイズ: 1080×1350px（4:5の比率）</div>
                  <div>• 最近のInstagram投稿に最適なサイズです</div>
                  <div>• ダウンロード後、Instagramアプリから投稿できます</div>
                  <div>• コピー機能は一部のブラウザでのみ利用可能です</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
