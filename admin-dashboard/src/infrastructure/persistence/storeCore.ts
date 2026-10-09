type SubscriberCallback = () => void;

const subscribers = new Set<SubscriberCallback>();

let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel('taxedge_workflow_channel');
  } catch (e) {
    console.warn('BroadcastChannel initialization failed:', e);
  }
}

export function subscribeStore(callback: SubscriberCallback): () => void {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}

export function notifyStoreListeners(): void {
  subscribers.forEach(cb => {
    try {
      cb();
    } catch (err) {
      console.error('Error in store subscriber:', err);
    }
  });
}

export function publishStoreEvent(type: string, payload?: unknown): void {
  notifyStoreListeners();
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ type, payload, timestamp: Date.now() });
    } catch (e) {
      console.warn('BroadcastChannel postMessage failed:', e);
    }
  }
}

export function registerBroadcastListener(onRemoteUpdate: () => void): void {
  if (broadcastChannel) {
    broadcastChannel.onmessage = () => {
      onRemoteUpdate();
    };
  }
}
