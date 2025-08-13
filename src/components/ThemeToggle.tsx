'use client';

import { Moon, Sun, Crown } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';

interface ThemeToggleProps {
  isPremium?: boolean;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

export function ThemeToggle({ 
  isPremium = false, 
  size = 'default',
  variant = 'ghost'
}: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button 
        variant={variant} 
        size={size}
        disabled
        className="w-9 h-9 p-0"
      >
        <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
      </Button>
    );
  }

  const handleThemeToggle = () => {
    // プレミアムユーザーでない場合はダークモードを制限
    if (!isPremium && theme === 'light') {
      setShowPremiumDialog(true);
      return;
    }

    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const isDark = theme === 'dark';

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleThemeToggle}
        className={`relative ${size === 'sm' ? 'w-8 h-8 p-0' : 'w-9 h-9 p-0'}`}
        title={
          isPremium
            ? isDark
              ? 'ライトモードに切り替え'
              : 'ダークモードに切り替え'
            : 'ダークモード（プレミアム限定）'
        }
      >
        {isDark ? (
          <Sun className={`${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} text-yellow-500`} />
        ) : (
          <Moon className={`${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} text-gray-600`} />
        )}
        {!isPremium && (
          <Crown className="w-3 h-3 absolute -top-1 -right-1 text-yellow-500 bg-white rounded-full p-0.5" />
        )}
      </Button>

      {/* プレミアム制限ダイアログ */}
      <Dialog
        open={showPremiumDialog}
        onOpenChange={(open) => setShowPremiumDialog(open)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              ダークモードはプレミアム限定
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                🌙 ダークモードは目に優しく、夜間の作業に最適です。
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                プレミアムプランにアップグレードしてダークテーマを楽しみましょう！
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-300 mb-2 font-medium">
                ✨ プレミアムプラン（月300円）の特典
              </p>
              <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                <li>• ダークモード＆ライトモード切り替え</li>
                <li>• 無制限のタスク作成</li>
                <li>• 1年間の詳細統計</li>
              </ul>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              onClick={() => setShowPremiumDialog(false)}
            >
              後で
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                setShowPremiumDialog(false);
                router.push('/premium/upgrade');
              }}
            >
              アップグレード
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}