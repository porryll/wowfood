import { useEffect } from 'react';
import { useWowfoodStore } from '../store/useWowfoodStore';
import type { SharedSnapshot } from '../types';

interface RemoteSnapshot extends Partial<SharedSnapshot> {
  initialized?: boolean;
}

export function useSharedDataSync() {
  useEffect(() => {
    let cancelled = false;

    async function loadRemoteState() {
      try {
        const response = await fetch('/api/state');
        if (!response.ok) return;

        const snapshot = (await response.json()) as RemoteSnapshot;
        if (snapshot.initialized === false || typeof snapshot.revision !== 'number') {
          return;
        }

        const store = useWowfoodStore.getState();
        if (!cancelled && snapshot.revision !== store.remoteRevision) {
          store.hydrateSharedState(snapshot as SharedSnapshot);
        }
      } catch {
        // The local data server is a development convenience. The app still works offline.
      }
    }

    void loadRemoteState();
    const intervalId = window.setInterval(loadRemoteState, 1500);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);
}
