import { EnumTheme } from '@/renderer/store';

export const initTheme = () => {
  const darkThemeMq = window.matchMedia('(prefers-color-scheme: dark)');
  darkThemeMq.addEventListener('change', (e) => {
    if (e.matches) {
      document.body.setAttribute('arco-theme', 'dark');
    } else {
      document.body.removeAttribute('arco-theme');
    }
  });
};

// 切换主题
export const toggleTheme = (theme: EnumTheme) => {
  if (theme === EnumTheme.DARK) {
    document.body.setAttribute('arco-theme', 'dark');
  }
  if (theme === EnumTheme.LIGHT) {
    document.body.removeAttribute('arco-theme');
  }

  if (theme === EnumTheme.AUTO) {
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDarkMode) {
      document.body.setAttribute('arco-theme', 'dark');
    } else {
      document.body.removeAttribute('arco-theme');
    }
  }
};
