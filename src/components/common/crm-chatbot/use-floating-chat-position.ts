"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";

type Position = { right: number; bottom: number };
const GAP = 16;

export function useFloatingChatPosition(enabled = true) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<Position>({
    right: GAP,
    bottom: GAP,
  });
  const [dragging, setDragging] = useState(false);
  const gesture = useRef<{
    id: number;
    x: number;
    y: number;
    position: Position;
  } | null>(null);
  const suppressClick = useRef(false);

  const clamp = (next: Position): Position => {
    const bounds = containerRef.current?.getBoundingClientRect();
    return {
      right: Math.max(
        GAP,
        Math.min(next.right, window.innerWidth - (bounds?.width ?? 56) - GAP),
      ),
      bottom: Math.max(
        GAP,
        Math.min(
          next.bottom,
          window.innerHeight - (bounds?.height ?? 56) - GAP,
        ),
      ),
    };
  };

  useEffect(() => {
    if (!enabled) return;
    const keepVisible = () =>
      setPosition((current) => {
        const next = clamp(current);
        return next.right === current.right && next.bottom === current.bottom
          ? current
          : next;
      });
    const observer = new ResizeObserver(keepVisible);
    if (containerRef.current) observer.observe(containerRef.current);
    window.addEventListener("resize", keepVisible);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", keepVisible);
    };
  }, [enabled]);

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (!event.isPrimary || event.button !== 0) return;
    const bounds = containerRef.current?.getBoundingClientRect();
    if (!bounds) return;
    suppressClick.current = false;
    gesture.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      position: {
        right: window.innerWidth - bounds.right,
        bottom: window.innerHeight - bounds.bottom,
      },
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const start = gesture.current;
    if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (!suppressClick.current && Math.hypot(dx, dy) < 5) return;
    suppressClick.current = true;
    setDragging(true);
    setPosition(
      clamp({
        right: start.position.right - dx,
        bottom: start.position.bottom - dy,
      }),
    );
  };

  const endDrag = () => {
    gesture.current = null;
    setDragging(false);
  };
  const onClickCapture = (event: MouseEvent<HTMLButtonElement>) => {
    if (suppressClick.current) {
      suppressClick.current = false;
      // Keyboard activation must still work after a canceled pointer gesture.
      if (event.detail === 0) return;
      event.preventDefault();
      event.stopPropagation();
    }
  };
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const step = event.shiftKey ? 20 : 10;
    const delta: Record<string, Position> = {
      ArrowLeft: { right: step, bottom: 0 },
      ArrowRight: { right: -step, bottom: 0 },
      ArrowUp: { right: 0, bottom: step },
      ArrowDown: { right: 0, bottom: -step },
    };
    if (!delta[event.key] && event.key !== "Home") return;
    event.preventDefault();
    const movement = delta[event.key];
    setPosition((current) =>
      clamp(
        movement
          ? {
              right: current.right + movement.right,
              bottom: current.bottom + movement.bottom,
            }
          : { right: GAP, bottom: GAP },
      ),
    );
  };

  return {
    containerRef,
    position,
    dragging,
    handleProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: () => {
        suppressClick.current = false;
        endDrag();
      },
      onLostPointerCapture: endDrag,
      onClickCapture,
      onKeyDown,
    },
  };
}
