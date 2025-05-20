import React from "react";

interface TileProps {
  color: number[];
  highlighted?: boolean;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  draggable?: boolean;
}

const Tile: React.FC<TileProps> = ({ color, highlighted, onClick, onDragStart, onDrop, draggable }) => {
  return (
    <div
      className={`tile${highlighted ? ' highlighted' : ''}`}
      style={{
        background: `rgb(${color.join(",")})`,
        border: highlighted ? '2px solid red' : '1px solid #333',
        width: 32,
        height: 32,
        display: 'inline-block',
        margin: 2,
        cursor: draggable || onClick ? 'pointer' : 'default',
      }}
      title={`rgb(${color.join(", ")})`}
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      onDrop={onDrop}
    />
  );
};

export default Tile; 