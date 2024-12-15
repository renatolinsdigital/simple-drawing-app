import { useState, useRef, useCallback, useEffect, PointerEvent } from "react";

export function usePan() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canPan, setCanPan] = useState({ x: false, y: false });

  const updatePanAndCanPan = useCallback(() => {
    const svg = svgRef.current;
    const container = containerRef.current;

    if (!container || !svg) return;

    const svgRect = svg.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const canPanX = svgRect.width > containerRect.width;
    const canPanY = svgRect.height > containerRect.height;

    setCanPan({ x: canPanX, y: canPanY });

    setPan((prevPan) => ({
      x: Math.min(Math.max(prevPan.x, containerRect.width - svgRect.width), 0),
      y: Math.min(
        Math.max(prevPan.y, containerRect.height - svgRect.height),
        0
      ),
    }));
  }, []);

  useEffect(() => {
    updatePanAndCanPan();
    window.addEventListener("resize", updatePanAndCanPan);
    return () => {
      window.removeEventListener("resize", updatePanAndCanPan);
    };
  }, [updatePanAndCanPan]);

  const handlePointerDown = (e: PointerEvent<SVGSVGElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    if (e.button === 1) {
      setIsPanning(true);
    }
  };

  const handlePointerMove = (e: PointerEvent<SVGSVGElement>) => {
    if (!isPanning) return;

    setPan((prevPan) => {
      const container = containerRef.current;
      const svg = svgRef.current;
      if (!container || !svg) return prevPan;

      const containerRect = container.getBoundingClientRect();
      const svgRect = svg.getBoundingClientRect();

      const newX = Math.min(
        Math.max(prevPan.x + e.movementX, containerRect.width - svgRect.width),
        0
      );
      const newY = Math.min(
        Math.max(
          prevPan.y + e.movementY,
          containerRect.height - svgRect.height
        ),
        0
      );

      return { x: newX, y: newY };
    });
  };

  const handlePointerUp = (e: PointerEvent<SVGSVGElement>) => {
    if (e.button === 1) {
      setIsPanning(false);
    }
  };

  return {
    pan,
    canPan,
    svgRef,
    isPanning,
    containerRef,
    handlePointerUp,
    handlePointerDown,
    handlePointerMove,
  };
}
