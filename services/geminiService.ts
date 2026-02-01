import { GoogleGenAI } from "@google/genai";
import { WorkoutSession } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateMarkdownSummary = async (sessions: WorkoutSession[]): Promise<string> => {
  if (sessions.length === 0) return "データがありません。";

  const ai = getClient();
  const modelId = 'gemini-3-flash-preview';

  const prompt = `
    あなたはプロのフィットネストレーナー兼データアナリストです。
    以下の筋トレログ（JSON形式）をもとに、ブログやSNSに投稿できるような、
    モチベーションが上がる魅力的なMarkdown形式の日記/レポートを作成してください。

    **要件:**
    1. セッションごとに見やすく整理する（日付、部位、主な種目）。
    2. 合計挙上重量（Volume）や成長の傾向があれば称賛するコメントを一言添える。
    3. 全体のまとめとして、次のトレーニングに向けたアドバイスを含める。
    4. 出力はMarkdownテキストのみを返してください（コードブロックのラップは不要）。

    **データ:**
    ${JSON.stringify(sessions, null, 2)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });
    
    return response.text || "生成に失敗しました。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `エラーが発生しました: ${(error as Error).message}`;
  }
};

export const suggestNextWorkout = async (lastSession: WorkoutSession | undefined): Promise<string> => {
  const ai = getClient();
  const modelId = 'gemini-3-flash-preview';

  const prompt = `
    前回のトレーニング内容: ${lastSession ? JSON.stringify(lastSession) : 'なし'}
    
    次に行うべきトレーニングのおすすめ部位と、具体的なメニュー案を3つ、簡潔な箇条書きで提案してください。
    日本語でお願いします。
  `;

   try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });
    return response.text || "提案を取得できませんでした。";
  } catch (error) {
     return "提案機能は現在利用できません。";
  }
};