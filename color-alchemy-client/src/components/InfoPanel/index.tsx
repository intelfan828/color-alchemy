import React from "react";

interface InfoPanelProps {
  userId: string;
  movesLeft: number;
  target: number[];
  closest: number[];
  delta: number;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ userId, movesLeft, target, closest, delta }) => {
  return (
    <div className="info-panel">
      <div><strong>RGB Alchemy</strong></div>
      <div>User ID: {userId}</div>
      <div>Moves left: {movesLeft}</div>
      <div>
        Target color: <span 
          className="color-swatch"
          title={`rgb(${target.join(", ")})`} 
          style={{ background: `rgb(${target.join(",")})` }} 
        />
      </div>
      <div>
        Closest color: <span 
          className="color-swatch"
          title={`rgb(${closest.join(", ")})`} 
          style={{ background: `rgb(${closest.join(",")})` }} 
        />
        Δ={ (delta * 100).toFixed(2) }%
      </div>
    </div>
  );
};

export default InfoPanel; 