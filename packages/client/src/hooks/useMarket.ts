import { useEffect, useRef } from 'react';
import { marketSocket } from '../socket/client';
import { useSocket } from './useSocket';
import { useMarketStore } from '../stores/marketStore';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import type { VIXLevel, DailyQuest, QuestLogEntry, NewsItem } from '@game/shared';

/**
 * Hook that subscribes to VIX ticks and quest updates on the /market namespace.
 */
export function useMarket(enabled = true) {
  const socket = useSocket(marketSocket, enabled);
  const prevRegimeRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const notify = useUIStore.getState().addNotification;

    const onVIXUpdate = (vix: VIXLevel) => {
      useMarketStore.getState().updateVIX(vix);

      // Notify on regime changes
      const prevRegime = prevRegimeRef.current;
      if (prevRegime && prevRegime !== vix.regime) {
        const regimeLabels: Record<string, string> = {
          calm: '🟢 Calm — low risk',
          normal: '🔵 Normal — balanced',
          elevated: '🟡 Elevated — caution',
          high: '🟠 High — vega penalties active!',
          extreme: '🔴 EXTREME — max volatility!',
        };
        notify('warning', `VIX regime → ${regimeLabels[vix.regime] ?? vix.regime}`);
      }
      prevRegimeRef.current = vix.regime;
    };

    const onDailyQuest = (quest: DailyQuest) => {
      // Replace or add quest to active quests
      const store = useMarketStore.getState();
      const existing = store.activeQuests.find((q) => q.id === quest.id);
      if (!existing) {
        store.setQuests([...store.activeQuests, quest]);
      }
    };

    const onQuestLog = (entry: QuestLogEntry) => {
      useMarketStore.getState().completeQuest(entry.id);
    };

    const onNews = (item: NewsItem) => {
      useMarketStore.getState().addNews(item);
    };

    socket.on('market:vixUpdate', onVIXUpdate);
    socket.on('market:dailyQuest' as any, onDailyQuest);
    socket.on('market:questLog' as any, onQuestLog);
    socket.on('market:news' as any, onNews);

    // Subscribe to market feed with tier info
    const tier = useAuthStore.getState().user?.tier ?? 'Apprentice';
    socket.emit('market:subscribe', { tier } as any);

    return () => {
      socket.off('market:vixUpdate', onVIXUpdate);
      socket.off('market:dailyQuest' as any, onDailyQuest);
      socket.off('market:questLog' as any, onQuestLog);
      socket.off('market:news' as any, onNews);
    };
  }, [socket, enabled]);

  return {
    vixLevel: useMarketStore((s) => s.vixLevel),
    vixHistory: useMarketStore((s) => s.vixHistory),
    quests: useMarketStore((s) => s.activeQuests),
    newsItems: useMarketStore((s) => s.newsItems),
  };
}
