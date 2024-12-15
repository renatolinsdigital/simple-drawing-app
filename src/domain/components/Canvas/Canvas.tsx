import "./Canvas.scss";
import { usePan } from "./usePan";
import { exportToPng } from "./export";
import { strokeOptions } from "@/strokeConfig";
import { FaDownload } from "react-icons/fa";
import { getStroke } from "perfect-freehand";
import { Point, Stroke } from "./Canvas.model";
import { getSvgPathFromStroke } from "./utils";
import { useState, PointerEvent, useEffect } from "react";

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;
const CTRL_Z_HISTORY_SIZE = 20;

function Canvas() {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [brushSize, setBrushSize] = useState<number>(3);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [canvasColor, setCanvasColor] = useState<string>("#FFFFFF");
  const [strokeHistory, setStrokeHistory] = useState<Stroke[][]>([]);
  const [currentColor, setCurrentColor] = useState<string>("#000000");
  const [tempCanvasColor, setTempCanvasColor] = useState<string>("#FFFFFF");
  const {
    pan,
    canPan,
    svgRef,
    isPanning,
    containerRef,
    handlePointerUp,
    handlePointerDown,
    handlePointerMove,
  } = usePan();

  function handlePointerDownWrapper(e: PointerEvent<SVGSVGElement>) {
    handlePointerDown(e);
    if (e.button !== 1) {
      const svgRect = svgRef.current?.getBoundingClientRect();
      if (svgRect) {
        setCurrentStroke([
          [e.clientX - svgRect.left, e.clientY - svgRect.top, e.pressure],
        ]);
      }
    }
  }

  function handlePointerMoveWrapper(e: PointerEvent<SVGSVGElement>) {
    handlePointerMove(e);
    if (!isPanning && e.buttons === 1) {
      const svgRect = svgRef.current?.getBoundingClientRect();
      if (svgRect) {
        setCurrentStroke((prevStroke) => [
          ...prevStroke,
          [e.clientX - svgRect.left, e.clientY - svgRect.top, e.pressure],
        ]);
      }
    }
  }

  function handlePointerUpWrapper(e: PointerEvent<SVGSVGElement>) {
    handlePointerUp(e);
    if (e.button !== 1 && currentStroke.length > 0) {
      const newStroke = {
        size: brushSize,
        color: currentColor,
        points: currentStroke,
      };
      const newStrokes = [...strokes, newStroke];

      setStrokes(newStrokes);
      setStrokeHistory((prevHistory) => {
        const updatedHistory = [...prevHistory, strokes];
        if (updatedHistory.length > 20) {
          updatedHistory.splice(0, updatedHistory.length - CTRL_Z_HISTORY_SIZE);
        }
        return updatedHistory;
      });
      setCurrentStroke([]);
    }
  }

  const onExport = () => {
    exportToPng(svgRef, canvasColor);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Delete") {
      setStrokes([]);
      setCurrentStroke([]);
      setStrokeHistory([]);
    } else if (e.ctrlKey && e.key === "z") {
      if (strokeHistory.length > 0) {
        const previousStrokes = strokeHistory[strokeHistory.length - 1];
        setStrokes(previousStrokes);
        setStrokeHistory(strokeHistory.slice(0, -1));
      }
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [strokeHistory]);

  return (
    <div
      ref={containerRef}
      style={{
        cursor: isPanning ? "grab" : "default",
      }}
      className="canvas-container"
    >
      <div className="color-picker-container canvas">
        <input
          type="color"
          value={tempCanvasColor}
          className="color-picker"
          onBlur={() => setCanvasColor(tempCanvasColor)}
          onChange={(e) => setTempCanvasColor(e.target.value)}
        />
      </div>
      <div className="color-picker-container brush">
        <input
          type="color"
          value={currentColor}
          className="color-picker"
          onChange={(e) => setCurrentColor(e.target.value)}
        />
      </div>
      <div className="brush-size-container">
        <div className="range-slider">
          <input
            min="1"
            max="100"
            type="range"
            id="brush-size"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
          />
          <span>{brushSize}</span>
        </div>
      </div>
      <button onClick={onExport} className="export-button">
        <FaDownload />
      </button>
      <svg
        style={{
          top: `${pan.y}px`,
          left: `${pan.x}px`,
          width: `${CANVAS_WIDTH}px`,
          height: `${CANVAS_HEIGHT}px`,
          minWidth: `${CANVAS_WIDTH}px`,
          minHeight: `${CANVAS_HEIGHT}px`,
          backgroundColor: canvasColor,
        }}
        ref={svgRef}
        className="canvas"
        onPointerUp={handlePointerUpWrapper}
        onPointerDown={handlePointerDownWrapper}
        onPointerMove={handlePointerMoveWrapper}
      >
        {strokes.map((stroke, index) => {
          const pathData = getSvgPathFromStroke(
            getStroke(stroke.points, {
              ...strokeOptions,
              smoothing: 2,
              size: stroke.size,
            }).map((point) => [point[0], point[1], point[2]])
          );

          return (
            <path key={index} d={pathData} stroke="none" fill={stroke.color} />
          );
        })}
        {currentStroke.length > 0 && (
          <path
            d={getSvgPathFromStroke(
              getStroke(currentStroke, {
                ...strokeOptions,
                smoothing: 1,
                size: brushSize,
              }).map((point) => [point[0], point[1], point[2]])
            )}
            stroke="none"
            fill={currentColor}
          />
        )}
      </svg>
      {(canPan.x || canPan.y) && (
        <div className="scroll-indicator">
          {canPan.x && <div className="scroll-x"></div>}
          {canPan.y && <div className="scroll-y"></div>}
        </div>
      )}
    </div>
  );
}

export default Canvas;
