'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ThemeProviderProps } from 'next-themes';

const PremiumThemeContext = createContext<{
  isPremium: boolean;
  setIsPremium: (value: boolean) => void;
}>({
  isPremium: false,
  setIsPremium: () => {},
});

interface PremiumThemeProviderProps extends ThemeProviderProps {
  children: React.ReactNode;
  isPremium?: boolean;
}

export function PremiumThemeProvider({ 
  children, 
  isPremium = false,
  ...props 
}: PremiumThemeProviderProps) {
  const [isPremiumState, setIsPremiumState] = useState(isPremium);

  // プレミアムステータスが変更された時の処理
  useEffect(() => {
    setIsPremiumState(isPremium);
  }, [isPremium]);

  return (
    <PremiumThemeContext.Provider 
      value={{ 
        isPremium: isPremiumState, 
        setIsPremium: setIsPremiumState 
      }}
    >
      <NextThemesProvider {...props}>
        {children}
      </NextThemesProvider>
    </PremiumThemeContext.Provider>
  );
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

export const usePremiumTheme = () => {
  const context = useContext(PremiumThemeContext);
  if (context === undefined) {
    throw new Error('usePremiumTheme must be used within a PremiumThemeProvider');
  }
  return context;
};