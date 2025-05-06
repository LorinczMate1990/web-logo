import React, { useRef, useEffect, useState, WheelEventHandler } from "react";

interface DraggableProps {
  top: number;
  left: number;
  onDrag: (deltaX: number, deltaY: number) => void;
  onWheel: (delta : number) => void;
  
  children: React.ReactNode;
}

const Draggable: React.FC<DraggableProps> = ({ top, left, children, onDrag, onWheel }) => {
  const draggingRef = useRef(false);
  const lastMousePosition = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingRef.current || !lastMousePosition.current) return;

      const deltaX = e.clientX - lastMousePosition.current.x;
      const deltaY = e.clientY - lastMousePosition.current.y;

      lastMousePosition.current = { x: e.clientX, y: e.clientY };

      if (onDrag) {
        onDrag(deltaX, deltaY);
      }
    };

    const handleMouseUp = () => {
      draggingRef.current = false;
      lastMousePosition.current = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [onDrag]);

  const handleMouseDown = (e: React.MouseEvent) => {
    draggingRef.current = true;
    lastMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      onWheel={(e) => onWheel(Math.sign(e.deltaY))}
      style={{
        position: "absolute",
        top: top,
        left: left,
        cursor: "grab",
      }}
    >
      {children}
    </div>
  );
};

export default Draggable;
