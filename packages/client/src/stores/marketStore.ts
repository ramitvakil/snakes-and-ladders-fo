import { create } from 'zustand';
import type { VIXLevel, DailyQuest, NewsItem } from '@game/shared';

const MAX_NEWS_ITEMS = 50;

interface MarketState {
  vixLevel: VIXLevel | null;
  vixHistory: VIXLevel[];
  activeQuests: DailyQuest[];
  completedQuestIds: Set<string>;
  newsItems: NewsItem[];

  updateVIX: (level: VIXLevel) => void;
  setQuests: (quests: DailyQuest[]) => void;
  completeQuest: (questId: string) => void;
  addNews: (item: NewsItem) => void;
  reset: () => void;
}

export const useMarketStore = create<MarketState>((set) => ({
  vixLevel: null,
  vixHistory: [],
  activeQuests: [],
  completedQuestIds: new Set(),
  newsItems: [],

  updateVIX: (level) =>
    set((state) => ({
      vixLevel: level,
      vixHistory: [...state.vixHistory.slice(-60), level], // Keep last 60 ticks
    })),

  setQuests: (quests) => set({ activeQuests: quests }),

  completeQuest: (questId) =>
    set((state) => {
      const newCompleted = new Set(state.completedQuestIds);
      newCompleted.add(questId);
      return {
        completedQuestIds: newCompleted,
        activeQuests: state.activeQuests.map((q) =>
          q.id === questId ? { ...q, isCompleted: true } : q,
        ),
      };
    }),

  addNews: (item) =>
    set((state) => ({
      newsItems: [item, ...state.newsItems].slice(0, MAX_NEWS_ITEMS),
    })),

  reset: () =>
    set({
      vixLevel: null,
      vixHistory: [],
      activeQuests: [],
      completedQuestIds: new Set(),
      newsItems: [],
    }),
}));
