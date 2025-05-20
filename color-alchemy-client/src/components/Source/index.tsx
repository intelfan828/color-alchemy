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
      className="source"
      style={{
        background: `rgb(${color.join(",")})`,
        border: '2px solid #fff',
        borderRadius: '50%',
        width: 32,
        height: 32,
        display: 'inline-block',
        margin: 2,
        cursor: onClick || draggable ? 'pointer' : 'default',
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