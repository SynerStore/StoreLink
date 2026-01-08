declare const describe: any;
declare const it: any;
declare const expect: any;
declare const beforeEach: any;
import { toggleTheme, initTheme } from '@/renderer/utils/theme';
import { EnumTheme } from '@/renderer/store/useSettingStore';

const setupMatchMedia = (initialDark = false) => {
  // @ts-ignore
  window.matchMedia = (query: string) => {
    let matches = initialDark && query.includes('prefers-color-scheme: dark');
    const listeners: Array<(e: MediaQueryListEvent) => void> = [];
    return {
      matches,
      media: query,
      onchange: null,
      addEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => {
        listeners.push(cb);
      },
      removeEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => {
        const i = listeners.indexOf(cb);
        if (i >= 0) listeners.splice(i, 1);
      },
      dispatch: (nextMatches: boolean) => {
        matches = nextMatches;
        const evt = { matches } as MediaQueryListEvent;
        listeners.forEach((cb) => cb(evt));
      },
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => true,
    } as any;
  };
};

describe('theme utils', () => {
  beforeEach(() => {
    document.body.removeAttribute('data-theme');
    document.body.classList.remove('dark-theme', 'light-theme');
    setupMatchMedia(false);
  });

  it('toggleTheme sets dark', () => {
    toggleTheme(EnumTheme.DARK);
    expect(document.body.getAttribute('data-theme')).toBe('dark');
  });

  it('toggleTheme sets light', () => {
    toggleTheme(EnumTheme.LIGHT);
    expect(document.body.getAttribute('data-theme')).toBeNull();
  });

  it('toggleTheme auto respects system dark', () => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)') as any;
    mq.dispatch(true);
    toggleTheme(EnumTheme.AUTO);
    expect(document.body.getAttribute('data-theme')).toBe('dark');
  });

  it('initTheme listens system changes', () => {
    initTheme();
    const mq = window.matchMedia('(prefers-color-scheme: dark)') as any;
    mq.dispatch(true);
    expect(document.body.getAttribute('data-theme')).toBe('dark');
    mq.dispatch(false);
    expect(document.body.getAttribute('data-theme')).toBeNull();
  });
});
