import { GameManager } from './GameManager.js';
import { MarketBroadcaster } from '../market/MarketBroadcaster.js';

const marketBroadcaster = new MarketBroadcaster();
export const gameManager = new GameManager(marketBroadcaster);
