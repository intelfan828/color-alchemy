import React from "react";

interface SourceProps {
  color: number[];
  onClick?: () => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  draggable?: boolean;
}

const Source: React.FC<SourceProps> = ({ color = [0,0,0], onClick, onDrop, onDragOver, draggable }) => {
  return (
    <div
      className={`source${draggable ? ' draggable' : ''}${onClick ? ' clickable' : ''}`}
      style={{
        background: `rgb(${color.join(",")})`,
      }}
      title={`rgb(${color.join(", ")})`}
      onClick={onClick}
      onDrop={onDrop}
      onDragOver={onDragOver}
      draggable={draggable}
    />
  );
};

export default Source; 