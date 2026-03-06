import * as Network from 'expo-network';
import { useEffect, useState } from 'react';
import { useStore } from '../store/context';

/**
 * Background component that automatically syncs offline results when network connection is restored.
 * Monitors network state and triggers courseStore.syncUnsyncedResults() when device comes online.
 */
export function SyncManager() {
  const { courseStore } = useStore();
  const [networkState, setNetworkState] = useState<Network.NetworkState | null>(
    null,
  );

  useEffect(() => {
    let subscription: { remove?: () => void } | undefined;
    (async () => {
      try {
        const initial = await Network.getNetworkStateAsync();
        setNetworkState(initial);
        subscription = Network.addNetworkStateListener(state =>
          setNetworkState(state),
        );
      } catch (err) {
        console.error('SyncManager network monitoring error', err);
      }
    })();

    return () => {
      if (subscription && typeof subscription.remove === 'function') {
        subscription.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (networkState?.isConnected) {
      courseStore.syncUnsyncedResults();
    }
  }, [networkState?.isConnected, courseStore]);

  return null;
}

export default SyncManager;
