import { createClient } from '@supabase/supabase-js';

// Supabase設定
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 環境変数の検証
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
];

const missingVars = requiredEnvVars.filter(
  (varName) => !import.meta.env[varName]
);

if (missingVars.length > 0) {
  console.error(
    'Supabase環境変数が設定されていません:',
    missingVars.join(', ')
  );
  console.error(
    '.env.localファイルを作成し、.env.exampleを参考に環境変数を設定してください。'
  );
}

// Supabaseクライアントの作成
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce', // PKCEフローを使用（より安全）
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'supabase.auth.token',
    },
    global: {
      headers: {
        'x-client-info': 'ironlog-ai'
      }
    }
  }
);

// デバッグ用: 環境変数の確認
if (typeof window !== 'undefined') {
  console.log('Supabase設定:', {
    url: supabaseUrl ? '設定済み' : '未設定',
    key: supabaseAnonKey ? '設定済み' : '未設定',
    urlValue: supabaseUrl?.substring(0, 30) + '...',
  });
}

export default supabase;
