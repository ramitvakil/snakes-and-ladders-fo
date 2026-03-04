import type { TourStep } from './GuidedTour';

/** Tour steps shown on the Home page for first-time visitors */
export const homeTourSteps: TourStep[] = [
  {
    title: 'Welcome to Snakes & Ladders F&O! 🎉',
    content:
      'This is a market-themed board game where your trading intuition matters. Let us show you around in 30 seconds.',
  },
  {
    target: 'nav a[href="/"]',
    title: 'Home',
    content: 'You are on the Home page. Click the logo anytime to return here.',
    position: 'bottom',
  },
  {
    target: 'nav a[href="/leaderboard"]',
    title: 'Leaderboard',
    content: 'Check the global leaderboard to see top players ranked by capital.',
    position: 'bottom',
  },
  {
    target: 'nav a[href="/login"], nav a[href="/lobby"]',
    title: 'Sign In / Lobby',
    content:
      'Sign in (or register) to access the Game Lobby where you can create or join games.',
    position: 'bottom',
  },
  {
    target: 'a[href="/register"], a[href="/lobby"]',
    title: 'Get Started',
    content:
      'Click "Create Account" to register, or "Play Now" if you\'re already signed in. Then head to the Lobby to start a game!',
    position: 'top',
  },
  {
    title: 'Need help later?',
    content:
      'Click the "?" button in the navigation bar at any time to replay this tour or open the "How to Play" guide. Enjoy the game!',
  },
];

/** Tour steps shown on the Lobby page */
export const lobbyTourSteps: TourStep[] = [
  {
    title: 'Welcome to the Lobby! 🏟️',
    content: 'This is where you create or join game rooms. Let us walk you through the options.',
  },
  {
    target: 'button:has-text("Quick Single-Player"), button.bg-violet-600',
    title: 'Quick Single-Player',
    content:
      'Click here to instantly start a game against an AI bot. Perfect for learning the ropes!',
    position: 'bottom',
  },
  {
    target: 'input[placeholder="Room name"]',
    title: 'Create a Room',
    content:
      'Enter a room name and click "Create" to host a multiplayer game. Friends can then join your room.',
    position: 'bottom',
  },
  {
    title: 'Open Rooms',
    content:
      'Below the form you\'ll see available rooms from other players. Click "Join" to hop into any room that isn\'t full.',
  },
  {
    title: 'Starting the Game',
    content:
      'Once in a room, you can add bots to fill empty seats, then click "Start Game" when ready. You need at least 2 players.',
  },
];

/** Tour steps shown on the Game page */
export const gameTourSteps: TourStep[] = [
  {
    title: 'Game Board 🎲',
    content:
      'The board has 100 tiles. Your goal: reach ₹2,00,000 capital. Snakes pull you back, ladders push you forward, and event tiles trigger market effects.',
  },
  {
    target: '.glass-card:has(p.text-emerald-400)',
    title: 'Turn Controls',
    content:
      'When it\'s your turn: 1) Pick a Market View (Bullish / Bearish / Sideways), 2) Set your Conviction level, 3) Roll the dice!',
    position: 'top',
  },
  {
    target: 'aside',
    title: 'Sidebar Info',
    content:
      'The sidebar shows the VIX meter (market volatility), active quests, and all player statuses. Keep an eye on VIX — high volatility amplifies both gains and losses.',
    position: 'left',
  },
  {
    title: 'Tips for New Players 💡',
    content:
      'Start with low conviction until you understand the tiles. Watch the VIX: when it\'s high, play conservative. Complete quests for bonus capital. Good luck!',
  },
];
