import { useEffect, useState } from "react";
import Alchemy, { TileState, SourceState } from "./components/Alchemy";
import InfoPanel from "./components/InfoPanel";
import Loading from "./components/Loading";
import { colorDistance } from "./utils/color";
import "./App.css";

export interface GameData {
  userId: string;
  width: number;
  height: number;
  maxMoves: number;
  target: number[];
}

function GameEndModal({ open, success, onOk, onCancel }: { open: boolean, success: boolean, onOk: () => void, onCancel: () => void }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{ background: '#fff', color: '#222', padding: 32, borderRadius: 12, minWidth: 320, textAlign: 'center', boxShadow: '0 2px 16px #0008' }}>
        <h2>{success ? 'Success!' : 'Game Over'}</h2>
        <p>{success ? 'You matched the target color! Play again?' : 'You ran out of moves. Play again?'}</p>
        <div style={{ marginTop: 24 }}>
          <button onClick={onOk} style={{ marginRight: 16, padding: '8px 24px', fontSize: 16 }}>OK</button>
          <button onClick={onCancel} style={{ padding: '8px 24px', fontSize: 16 }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [data, setData] = useState<GameData>();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isServerAvailable, setServerAvailabile] = useState<boolean>(true);
  const [movesLeft, setMovesLeft] = useState<number>(0);
  const [closestColor, setClosestColor] = useState<number[]>([0,0,0]);
  const [delta, setDelta] = useState<number>(1);
  const [showResult, setShowResult] = useState<null | boolean>(null);
  const pollingInterval = 5000; // every 5 seconds

  async function loadGameData() {
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:9876/init");
      if (!response.ok) {
        throw new Error("Failed to fetch game data");
      }
      const jsonData = await response.json();
      setData(jsonData);
      setMovesLeft(jsonData.maxMoves);
      setClosestColor([0,0,0]);
      setDelta(1);
      setIsLoading(false);
      setServerAvailabile(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred');
      setIsLoading(false);
      setServerAvailabile(false);
      serverRecoveryPolling();
    }
  }

  async function loadUserGameData(userId: string) {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:9876/init/user/${userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user game data");
      }
      const jsonData = await response.json();
      let newData = { ...jsonData };
      setData(newData);
      setMovesLeft(newData.maxMoves);
      setClosestColor([0,0,0]);
      setDelta(1);
      setIsLoading(false);
      setServerAvailabile(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred');
      setIsLoading(false);
      setServerAvailabile(false);
      serverRecoveryPolling(userId);
    }
  }
  useEffect(() => {
    loadGameData();
  }, []);

  const playGameAgain = (userId: string) => {
    loadUserGameData(userId);
    setShowResult(null);
  };

  const serverRecoveryPolling = (userID?: string) => {
    setTimeout(() => {
      setError(null);
      if (userID) {
        loadUserGameData(userID);
      } else {
        loadGameData();
      }
    }, pollingInterval);
  };

  const findClosestTile = (tiles: number[][][], target: number[]): { color: number[], delta: number } => {
    let minDelta = Infinity;
    let closest = [0,0,0];
    for (let row = 0; row < tiles.length; ++row) {
      for (let col = 0; col < tiles[row].length; ++col) {
        const d = colorDistance(tiles[row][col], target);
        if (d < minDelta) {
          minDelta = d;
          closest = tiles[row][col];
        }
      }
    }
    return { color: closest, delta: minDelta };
  };

  const handleMove = (tiles: TileState[][], sources: SourceState[][]) => {
    if (!data) return;
    const { color, delta } = findClosestTile(tiles, data.target);
    setClosestColor(color);
    setDelta(delta);
    setMovesLeft(movesLeft => movesLeft - 1);
  };

  const handleGameEnd = (success: boolean) => {
    setShowResult(success);
  };

  const handleModalOk = () => {
    if (data) playGameAgain(data.userId);
    setShowResult(null);
  };
  const handleModalCancel = () => {
    setShowResult(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', background: '#222', color: '#fff' }}>
      {isLoading && <Loading />}
      {error && <div style={{ color: 'red', margin: 20 }}>{error}</div>}
      {data && !isLoading && !error && (
        <>
          <InfoPanel
            userId={data.userId}
            movesLeft={movesLeft}
            target={data.target}
            closest={closestColor}
            delta={delta}
          />
          <Alchemy
            data={data}
            movesLeft={movesLeft}
            onMove={handleMove}
            onGameEnd={handleGameEnd}
          />
        </>
      )}
      <GameEndModal open={showResult !== null} success={!!showResult} onOk={handleModalOk} onCancel={handleModalCancel} />
    </div>
  );
}

export default App;
