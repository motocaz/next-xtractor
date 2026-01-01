'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ThemeToggle = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-9 w-9 rounded-md border border-border bg-background" />
    );
  }

  const handleThemeChange = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    if (theme === 'system') {
      return <Monitor className="h-4 w-4" />;
    }
    if (resolvedTheme === 'dark') {
      return <Moon className="h-4 w-4" />;
    }
    return <Sun className="h-4 w-4" />;
  };

  const getLabel = () => {
    if (theme === 'system') {
      return 'System';
    }
    return theme === 'light' ? 'Light' : 'Dark';
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleThemeChange}
      aria-label={`Switch theme. Current: ${getLabel()}`}
      title={`Current theme: ${getLabel()}. Click to cycle themes.`}
      className={cn(
        "relative h-9 w-9 rounded-md border-border",
        "hover:bg-accent hover:text-accent-foreground",
        "transition-colors"
      )}
    >
      {getIcon()}
      <span className="sr-only">Switch theme</span>
    </Button>
  );
};

export default ThemeToggle;

