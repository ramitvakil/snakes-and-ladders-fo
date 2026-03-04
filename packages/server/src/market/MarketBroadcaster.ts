import type { Server } from 'socket.io';
import type { ServerToClientEvents, ClientToServerEvents, InterServerEvents } from '@game/shared';
import { VIXSimulator } from './VIXSimulator.js';
import { QuestManager } from './QuestManager.js';
import { NewsEngine } from './NewsEngine.js';
import { createChildLogger } from '../config/logger.js';

type IO = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents>;

const log = createChildLogger('market:broadcaster');

/**
 * MarketBroadcaster ties VIX simulation + quest rotation + news feed to Socket.IO broadcasting.
 * It pushes VIX ticks, quest updates, and market news to the /market namespace.
 */
export class MarketBroadcaster {
  private vixSimulator: VIXSimulator;
  private questManager: QuestManager;
  private newsEngine: NewsEngine;
  private io: IO | null = null;
  private questRotationInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.vixSimulator = new VIXSimulator();
    this.questManager = new QuestManager();
    this.newsEngine = new NewsEngine(() => this.vixSimulator.getLevel().regime, 8_000);
  }

  /**
   * Initialize with Socket.IO server and start broadcasting.
   */
  start(io: IO): void {
    this.io = io;

    // Broadcast VIX ticks
    this.vixSimulator.onTick((level) => {
      if (this.io) {
        this.io.of('/market').emit('market:vixUpdate', level as any);
      }
    });

    this.vixSimulator.start();

    // Broadcast market news headlines
    this.newsEngine.onNews((item) => {
      if (this.io) {
        this.io.of('/market').emit('market:news', item as any);
      }
    });
    this.newsEngine.start();

    // Rotate quests every 30 minutes
    this.questRotationInterval = setInterval(() => {
      this.rotateQuests();
    }, 30 * 60 * 1000);

    // Generate initial quests
    this.rotateQuests();

    log.info('Market broadcaster started');
  }

  /**
   * Stop all timers and broadcasting.
   */
  stop(): void {
    this.vixSimulator.stop();
    this.newsEngine.stop();
    if (this.questRotationInterval) {
      clearInterval(this.questRotationInterval);
      this.questRotationInterval = null;
    }
    log.info('Market broadcaster stopped');
  }

  getVIXSimulator(): VIXSimulator {
    return this.vixSimulator;
  }

  getQuestManager(): QuestManager {
    return this.questManager;
  }

  /**
   * Generate new quests and broadcast to market subscribers.
   */
  private rotateQuests(): void {
    const vixLevel = this.vixSimulator.getLevel();
    const quests = this.questManager.generateQuests(vixLevel);

    if (this.io) {
      for (const quest of quests) {
        this.io.of('/market').emit('market:dailyQuest', quest);
      }
    }

    log.info({ questCount: quests.length }, 'Quests rotated');
  }
}
