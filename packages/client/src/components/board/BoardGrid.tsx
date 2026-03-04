import { TILE_LOOKUP, WARP_LOOKUP } from '@game/shared';
import type { Player } from '@game/shared';
import Tile from './Tile';
import PlayerToken from './PlayerToken';

interface BoardGridProps {
  players: Player[];
}

/**
 * Renders the 10×10 board grid with tile effects, warp indicators, and player tokens.
 * Board layout: row 1 (tiles 91-100) at top, row 10 (tiles 1-10) at bottom.
 * Even rows go left-to-right, odd rows go right-to-left (boustrophedon / snake pattern).
 */
export default function BoardGrid({ players }: BoardGridProps) {
  // Build rows from top (100) to bottom (1)
  const rows: number[][] = [];
  for (let row = 9; row >= 0; row--) {
    const start = row * 10 + 1;
    const rowTiles = Array.from({ length: 10 }, (_, col) => start + col);
    // Alternate direction: even rows (0,2,4...) L→R, odd rows R→L
    if (row % 2 === 1) rowTiles.reverse();
    rows.push(rowTiles);
  }

  return (
    <div className="board-grid overflow-visible rounded-xl border border-gray-700">
      {rows.flat().map((tileNum) => {
        const tileDef = TILE_LOOKUP.get(tileNum);
        const warp = WARP_LOOKUP.get(tileNum);
        const playersHere = players.filter((p) => p.position === tileNum);

        return (
          <Tile key={tileNum} number={tileNum} definition={tileDef} warp={warp}>
            {playersHere.map((p, i) => (
              <PlayerToken key={p.id} player={p} offset={i} />
            ))}
          </Tile>
        );
      })}
    </div>
  );
}
