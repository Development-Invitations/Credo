import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface LatestVersion {
  version: string;
  download_url: string;
  release_notes: string | null;
}

const CHECK_INTERVAL_MS = 5 * 60 * 1000;

/** Сравнивает версии вида "0.1.10" по числам, а не как строки (иначе "0.1.9" > "0.1.10"). */
function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map((n) => parseInt(n, 10) || 0);
  const pb = b.split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] || 0) - (pb[i] || 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

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

  // Баннер показываем, только если версия в базе РЕАЛЬНО новее текущей — а не просто "другая".
  // Иначе, например, при локальной разработке (когда в package.json уже стоит будущая версия,
  // а в базе ещё старая) баннер ошибочно предлагал бы "обновиться" на более старую версию.
  const updateAvailable = !!latestVersion && compareVersions(latestVersion.version, currentVersion) > 0;

  return { currentVersion, latestVersion, updateAvailable };
}
