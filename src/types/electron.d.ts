export {};

declare global {
  interface Window {
    electronAPI?: {
      getAppVersion: () => Promise<string>;
      checkForUpdate?: () => Promise<{ available: boolean; error?: string }>;
      downloadUpdate?: () => Promise<{ ok: boolean; error?: string }>;
      installUpdate?: () => void;
      onUpdateProgress?: (cb: (percent: number) => void) => void;
      onUpdateDownloaded?: (cb: () => void) => void;
      onUpdateError?: (cb: (message: string) => void) => void;
    };
  }
}
