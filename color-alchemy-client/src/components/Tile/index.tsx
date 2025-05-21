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
      className={`tile${highlighted ? ' highlighted' : ''}${draggable ? ' draggable' : ''}${onClick ? ' clickable' : ''}`}
      style={{
        background: `rgb(${color.join(",")})`,
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