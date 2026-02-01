import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // OAuth認証後のリダイレクト処理
    const handleAuthCallback = async () => {
      try {
        // URLフラグメントからセッションを取得（OAuth認証後のリダイレクト時）
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        if (accessToken && refreshToken) {
          // URLフラグメントからセッションを設定
          const { data: { session }, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          
          if (error) {
            console.error('セッション設定エラー:', error);
            setUser(null);
          } else if (session) {
            setUser(session.user);
            // URLをクリーンアップ
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } else {
          // 通常のセッション取得
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) {
            console.error('セッション取得エラー:', error);
            setUser(null);
          } else {
            setUser(session?.user ?? null);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error('認証処理エラー:', error);
        setLoading(false);
      }
    };

    // 初回セッション取得
    handleAuthCallback();

    // 認証状態の変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('認証状態変更:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setUser(session?.user ?? null);
        // URLをクリーンアップ
        if (window.location.hash) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      } else {
        setUser(session?.user ?? null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      const redirectTo = `${window.location.origin}${window.location.pathname}`;
      console.log('Google認証を開始:', { redirectTo });
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          skipBrowserRedirect: false,
        },
      });
      
      if (error) {
        console.error('Supabase認証エラー:', error);
        console.error('エラー詳細:', {
          message: error.message,
          status: error.status,
          name: error.name,
        });
        throw new Error(`認証エラー: ${error.message}`);
      }
      
      console.log('OAuth認証リダイレクト:', data);
      // OAuth認証はリダイレクトされるため、ここでは何もしない
    } catch (error: any) {
      console.error('ログインエラー:', error);
      console.error('エラー詳細:', {
        message: error?.message,
        stack: error?.stack,
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // ログアウト時にユーザーデータをクリア
      localStorage.removeItem('ironlog_sessions');
    } catch (error) {
      console.error('ログアウトエラー:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
