import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

declare global {
  interface Window {
    electronAPI?: { getAppVersion: () => Promise<string> };
  }
}

interface LatestVersion {
  version: string;
  download_url: string;
  release_notes: string | null;
}

const CHECK_INTERVAL_MS = 5 * 60 * 1000; // проверяем раз в 5 минут, пока приложение открыто

export function useAppVersion() {
  const [currentVersion, setCurrentVersion] = useState('0.1.0');
  const [latestVersion, setLatestVersion] = useState<LatestVersion | null>(null);

  useEffect(() => {
    window.electronAPI?.getAppVersion().then(setCurrentVersion);

    async function checkLatest() {
      const { data } = await supabase
        .from('app_versions')
        .select('version, download_url, release_notes')
        .order('released_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) setLatestVersion(data);
    }

    checkLatest();
    const interval = setInterval(checkLatest, CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const updateAvailable = !!latestVersion && latestVersion.version !== currentVersion;

  return { currentVersion, latestVersion, updateAvailable };
}
