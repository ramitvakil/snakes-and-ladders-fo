import type { DailyQuest, QuestType, VIXLevel } from '@game/shared';
import { QUEST_TEMPLATES } from '@game/shared';
import { createChildLogger } from '../config/logger.js';

const log = createChildLogger('market:quest');

/**
 * QuestManager generates and tracks daily/periodic quests for players.
 * Quests are tier-gated and rotate based on market conditions.
 */
export class QuestManager {
  private activeQuests: DailyQuest[] = [];
  private completedQuests: Map<string, Set<string>> = new Map(); // playerId → questIds

  /**
   * Generate a new set of quests based on current VIX regime.
   */
  generateQuests(vixLevel: VIXLevel): DailyQuest[] {
    const quests: DailyQuest[] = [];
    const templates = this.getTemplatesForRegime(vixLevel.regime);

    for (const template of templates) {
      const quest: DailyQuest = {
        id: `quest_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        questType: template.questType,
        title: template.title,
        description: template.description,
        targetValue: template.targetValue,
        currentProgress: 0,
        reward: template.reward,
        expiresAt: Date.now() + template.durationHours * 3600000,
        isCompleted: false,
      };

      quests.push(quest);
    }

    this.activeQuests = quests;

    log.info(
      { count: quests.length, regime: vixLevel.regime },
      'Quests generated',
    );

    return quests;
  }

  /**
   * Get active (non-expired) quests.
   */
  getQuestsForTier(_tier: string): DailyQuest[] {
    const now = Date.now();
    return this.activeQuests.filter((q) => q.expiresAt > now && !q.isCompleted);
  }

  /**
   * Record progress toward a quest for a player.
   */
  recordProgress(playerId: string, questType: QuestType, value: number): DailyQuest | null {
    const completed = this.completedQuests.get(playerId) ?? new Set();

    for (const quest of this.activeQuests) {
      if (quest.questType === questType && !completed.has(quest.id) && !quest.isCompleted) {
        quest.currentProgress = Math.min(quest.targetValue, quest.currentProgress + value);

        if (quest.currentProgress >= quest.targetValue) {
          quest.isCompleted = true;
          completed.add(quest.id);
          this.completedQuests.set(playerId, completed);

          log.info(
            { playerId, questId: quest.id, type: quest.questType },
            'Quest completed',
          );

          return quest;
        }

        return quest;
      }
    }

    return null;
  }

  /**
   * Select quest templates appropriate for the current VIX regime.
   */
  private getTemplatesForRegime(regime: string) {
    // In high volatility, offer more challenging quests with better rewards
    switch (regime) {
      case 'calm':
        return QUEST_TEMPLATES.slice(0, 3);
      case 'normal':
        return QUEST_TEMPLATES.slice(0, 5);
      case 'elevated':
        return QUEST_TEMPLATES.slice(1, 6);
      case 'high':
      case 'extreme':
        return QUEST_TEMPLATES.slice(3, 8);
      default:
        return QUEST_TEMPLATES.slice(0, 4);
    }
  }

  /**
   * Clean up expired quests.
   */
  cleanup(): void {
    const now = Date.now();
    this.activeQuests = this.activeQuests.filter((q) => q.expiresAt > now);
  }
}
