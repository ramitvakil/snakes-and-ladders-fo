import { create } from 'zustand';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

interface UIState {
  // Connection
  connectionStatus: ConnectionStatus;

  // Modals
  showSettings: boolean;
  showRules: boolean;
  showLeaderboard: boolean;
  showSubscription: boolean;
  showHowToPlay: boolean;

  // Guided Tour
  showTour: boolean;
  /** Which tour context to show: 'home', 'lobby', or 'game' */
  tourContext: 'home' | 'lobby' | 'game';

  // Notifications
  notifications: Array<{
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
    timestamp: number;
  }>;

  // Sound
  soundEnabled: boolean;

  // Actions
  setConnectionStatus: (status: ConnectionStatus) => void;
  toggleSettings: () => void;
  toggleRules: () => void;
  toggleLeaderboard: () => void;
  toggleSubscription: () => void;
  toggleHowToPlay: () => void;
  startTour: (context?: 'home' | 'lobby' | 'game') => void;
  closeTour: () => void;
  addNotification: (type: UIState['notifications'][0]['type'], message: string) => void;
  dismissNotification: (id: string) => void;
  toggleSound: () => void;
}

/** Returns true the first time a user visits (no tour completed yet) */
export function isFirstVisit(): boolean {
  return !localStorage.getItem('snakes-tour-seen');
}

export const useUIStore = create<UIState>((set) => ({
  connectionStatus: 'disconnected',
  showSettings: false,
  showRules: false,
  showLeaderboard: false,
  showSubscription: false,
  showHowToPlay: false,
  showTour: false,
  tourContext: 'home',
  notifications: [],
  soundEnabled: true,

  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),

  toggleSettings: () => set((s) => ({ showSettings: !s.showSettings })),
  toggleRules: () => set((s) => ({ showRules: !s.showRules })),
  toggleLeaderboard: () => set((s) => ({ showLeaderboard: !s.showLeaderboard })),
  toggleSubscription: () => set((s) => ({ showSubscription: !s.showSubscription })),
  toggleHowToPlay: () => set((s) => ({ showHowToPlay: !s.showHowToPlay })),

  startTour: (context = 'home') => set({ showTour: true, tourContext: context }),
  closeTour: () => set({ showTour: false }),

  addNotification: (type, message) =>
    set((s) => ({
      notifications: [
        ...s.notifications,
        {
          id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          type,
          message,
          timestamp: Date.now(),
        },
      ].slice(-10), // Keep max 10
    })),

  dismissNotification: (id) =>
    set((s) => ({
      notifications: s.notifications.filter((n) => n.id !== id),
    })),

  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
}));
