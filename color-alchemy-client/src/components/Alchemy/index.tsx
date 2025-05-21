import React, { useState } from "react";
import { GameData } from "../../App";
import Tile from "../Tile";
import Source from "../Source";
import { colorDistance, mixColors } from "../../utils/color";

// Use TileState and SourceState for type safety
export type SourceState = number[]; // [r,g,b]
export type TileState = number[]; // [r,g,b]

interface AlchemyProps {
  data: GameData;
  movesLeft: number;
  onMove: (tiles: TileState[][], sources: SourceState[][]) => void;
  onGameEnd: (success: boolean) => void;
}

function getInitialSources(width: number, height: number): SourceState[][] {
  // Top, Bottom, Left, Right sources
  return [
    Array.from({ length: width }, () => [0, 0, 0] as SourceState), // Top
    Array.from({ length: width }, () => [0, 0, 0] as SourceState), // Bottom
    Array.from({ length: height }, () => [0, 0, 0] as SourceState), // Left
    Array.from({ length: height }, () => [0, 0, 0] as SourceState), // Right
  ];
}

function getInitialTiles(width: number, height: number): TileState[][] {
  return Array(height).fill(0).map(() => Array(width).fill(0).map(() => [0,0,0]));
}

const PRIMARY_COLORS: number[][] = [
  [255, 0, 0], // Red
  [0, 255, 0], // Green
  [0, 0, 255], // Blue
];

const Alchemy: React.FC<AlchemyProps> = ({ data, movesLeft, onMove, onGameEnd }) => {
  const [sources, setSources] = useState<SourceState[][]>(() => data ? getInitialSources(data.width, data.height) : [[],[],[],[]]);
  const [tiles, setTiles] = useState<TileState[][]>(() => data ? getInitialTiles(data.width, data.height) : []);
  const [dragTile, setDragTile] = useState<{row: number, col: number} | null>(null);
  const [initialMovesDone, setInitialMovesDone] = useState(0);

  // Reset board state only when a new game starts (userId changes)
  React.useEffect(() => {
    if (!data) return;
    setSources(getInitialSources(data.width, data.height));
    setTiles(getInitialTiles(data.width, data.height));
    setDragTile(null);
    setInitialMovesDone(0);
  }, [data?.userId]);

  // Recompute tiles whenever sources change (except during direct setTiles in handlers)
  React.useEffect(() => {
    if (!data) return;
    const newTiles = computeTiles(sources);
    setTiles(newTiles);
  }, [sources]);

  // On every move, check for win/lose
  React.useEffect(() => {
    if (!data) return;
    const closest = findClosestTile(tiles, data.target);
    if (movesLeft <= 0 || closest.delta < 0.1) {
      onGameEnd(closest.delta < 0.1);
    }
  }, [tiles, movesLeft]);

  if (!data) return null;
  
  const { width, height, target, maxMoves } = data;

  // Compute tile colors based on sources
  function computeTiles(sources: SourceState[][]): TileState[][] {
    const newTiles: TileState[][] = [];
    for (let row = 0; row < height; ++row) {
      const rowArr: TileState[] = [];
      for (let col = 0; col < width; ++col) {
        const contributions: number[][] = [];
        // Debug: check sources structure
        // console.log('sources', sources, 'row', row, 'col', col);
        // Top source
        if (sources[0] && sources[0][col] && (sources[0][col][0] !== 0 || sources[0][col][1] !== 0 || sources[0][col][2] !== 0)) {
          const d = row + 1;
          const f = (height + 1 - d) / (height + 1);
          contributions.push([
            sources[0][col][0] * f,
            sources[0][col][1] * f,
            sources[0][col][2] * f,
          ]);
        }
        // Bottom source
        if (sources[1] && sources[1][col] && (sources[1][col][0] !== 0 || sources[1][col][1] !== 0 || sources[1][col][2] !== 0)) {
          const d = height - row;
          const f = (height + 1 - d) / (height + 1);
          contributions.push([
            sources[1][col][0] * f,
            sources[1][col][1] * f,
            sources[1][col][2] * f,
          ]);
        }
        // Left source
        if (sources[2] && sources[2][row] && (sources[2][row][0] !== 0 || sources[2][row][1] !== 0 || sources[2][row][2] !== 0)) {
          const d = col + 1;
          const f = (width + 1 - d) / (width + 1);
          contributions.push([
            sources[2][row][0] * f,
            sources[2][row][1] * f,
            sources[2][row][2] * f,
          ]);
        }
        // Right source
        if (sources[3] && sources[3][row] && (sources[3][row][0] !== 0 || sources[3][row][1] !== 0 || sources[3][row][2] !== 0)) {
          const d = width - col;
          const f = (width + 1 - d) / (width + 1);
          contributions.push([
            sources[3][row][0] * f,
            sources[3][row][1] * f,
            sources[3][row][2] * f,
          ]);
        }
        if (contributions.length === 0) {
          rowArr.push([0,0,0]);
        } else {
          rowArr.push(mixColors(contributions));
        }
      }
      newTiles.push(rowArr);
    }
    return newTiles;
  }

  // Find closest tile to target
  function findClosestTile(tiles: TileState[][], target: number[]): {row: number, col: number, color: number[], delta: number} {
    let minDelta = Infinity;
    let closest = {row: 0, col: 0, color: [0,0,0], delta: 1};
    for (let row = 0; row < tiles.length; ++row) {
      for (let col = 0; col < tiles[row].length; ++col) {
        const d = colorDistance(tiles[row][col], target);
        if (d < minDelta) {
          minDelta = d;
          closest = {row, col, color: tiles[row][col], delta: d};
        }
      }
    }
    return closest;
  }

  // Handle source click (first 3 moves)
  function handleSourceClick(pos: {side: number, idx: number}) {
    if (initialMovesDone >= 3 || movesLeft <= 0) return;
    // Prevent placing a source where one already exists
    if (sources[pos.side][pos.idx][0] !== 0 || sources[pos.side][pos.idx][1] !== 0 || sources[pos.side][pos.idx][2] !== 0) return;
    const color = PRIMARY_COLORS[initialMovesDone];
    const newSources: SourceState[][] = sources.map(arr => arr.map(c => [...c] as SourceState));
    newSources[pos.side][pos.idx] = color;
    const newTiles = computeTiles(newSources);
    setSources(newSources);
    setTiles(newTiles);
    setInitialMovesDone(initialMovesDone + 1);
    onMove(newTiles, newSources);
  }

  // Handle drag start for tile
  function handleTileDragStart(row: number, col: number) {
    if (initialMovesDone < 3 || movesLeft <= 0) return;
    setDragTile({row, col});
  }

  // Handle drop on source (after 3 moves)
  function handleSourceDrop(side: number, idx: number) {
    if (initialMovesDone < 3 || movesLeft <= 0 || !dragTile) return;
    const color = tiles[dragTile.row][dragTile.col];
    const newSources: SourceState[][] = sources.map(arr => arr.map(c => [...c] as SourceState));
    newSources[side][idx] = color;
    const newTiles = computeTiles(newSources);
    setSources(newSources);
    setTiles(newTiles);
    setDragTile(null);
    onMove(newTiles, newSources);
  }

  // Prevent default for drag over
  function handleSourceDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  // Render sources and tiles
  return (
    <div className="alchemy-board">
      {/* Top sources */}
      <div className="alchemy-row alchemy-row-top">
        <div className="alchemy-corner" />
        {sources[0]?.map((color, i) => (
          <Source
            key={"top-"+i}
            color={color}
            onClick={() => handleSourceClick({side: 0, idx: i})}
            onDrop={e => { handleSourceDrop(0, i); }}
            onDragOver={handleSourceDragOver}
            draggable={false}
          />
        ))}
        <div className="alchemy-corner" />
      </div>
      {/* Main grid with left/right sources */}
      {tiles.map((rowArr, rowIdx) => (
        <div className="alchemy-row" key={"row-"+rowIdx}>
          <Source
            color={sources[2]?.[rowIdx] || [0,0,0]}
            onClick={() => handleSourceClick({side: 2, idx: rowIdx})}
            onDrop={e => { handleSourceDrop(2, rowIdx); }}
            onDragOver={handleSourceDragOver}
            draggable={false}
          />
          {rowArr.map((color, colIdx) => {
            const closest = findClosestTile(tiles, target);
            return (
              <Tile
                key={"tile-"+rowIdx+"-"+colIdx}
                color={color}
                highlighted={closest.row === rowIdx && closest.col === colIdx}
                onDragStart={initialMovesDone >= 3 && movesLeft > 0 ? () => handleTileDragStart(rowIdx, colIdx) : undefined}
                draggable={initialMovesDone >= 3 && movesLeft > 0}
              />
            );
          })}
          <Source
            color={sources[3]?.[rowIdx] || [0,0,0]}
            onClick={() => handleSourceClick({side: 3, idx: rowIdx})}
            onDrop={e => { handleSourceDrop(3, rowIdx); }}
            onDragOver={handleSourceDragOver}
            draggable={false}
          />
        </div>
      ))}
      {/* Bottom sources */}
      <div className="alchemy-row alchemy-row-bottom">
        <div className="alchemy-corner" />
        {sources[1]?.map((color, i) => (
          <Source
            key={"bot-"+i}
            color={color}
            onClick={() => handleSourceClick({side: 1, idx: i})}
            onDrop={e => { handleSourceDrop(1, i); }}
            onDragOver={handleSourceDragOver}
            draggable={false}
          />
        ))}
        <div className="alchemy-corner" />
      </div>
    </div>
  );
};

export default Alchemy; 