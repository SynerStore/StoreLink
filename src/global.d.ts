declare module '*.css';
declare module '*.png';

declare global {
  interface Window {
    electronBridge: any;
  }
}

export {};
