import { activeToolClass, toolClass } from "@/constant/constant";
import { Tooltip } from "@nextui-org/react";
import {
  IconAlphabetLatin,
  IconCircle,
  IconDeviceFloppy,
  IconHandGrab,
  IconMenu,
  IconPencilMinus,
  IconRectangle,
  IconSignature,
  IconSquare,
  IconSquareRoundedX,
} from "@tabler/icons-react";
import Konva from "konva";
import { useCallback, useEffect, useRef, useState } from "react";
import { Circle, Ellipse, Layer, Line, Rect, Stage, Text } from "react-konva";

function Whiteboard() {
  const [deviceSize, setDeviceSize] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [drawing, setDrawing] = useState(false);
  const [lines, setLines] = useState([]);
  const [rectangles, setRectangles] = useState([]);
  const [squares, setSquares] = useState([]);
  const [circles, setCircles] = useState([]);
  const [ellipses, setEllipses] = useState([]); // Add a new state variable for ellipses
  const [straightLines, setStraightLines] = useState([]); // Add a new state variable for straight lines

  const [isShiftPressed, setIsShiftPressed] = useState(false);

  const [texts, setTexts] = useState([]); // State for text annotations

  const canvasRef = useRef(null);
  const stageRef = useRef(null);
  const [drawingMode, setDrawingMode] = useState("freehand");
  const [startPoint, setStartPoint] = useState(null);

  useEffect(() => {
    const handleKeyDown = event => {
      if (event.key === "Shift") {
        setIsShiftPressed(true);
      }
    };

    const handleKeyUp = event => {
      if (event.key === "Shift") {
        setIsShiftPressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const handleResize = useCallback(() => {
    const width = window.innerWidth;

    if (width >= 1280) {
      setDeviceSize("xl");
    } else if (width >= 1024) {
      setDeviceSize("lg");
    } else if (width >= 768) {
      setDeviceSize("md");
    } else if (width >= 640) {
      setDeviceSize("sm");
    } else {
      setDeviceSize("max-sm");
    }
  }, []);

  // side effect
  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);

  const handleMouseDown = () => {
    if (isShiftPressed || drawingMode === "drag") return; // Ignore drawing if Shift is pressed or drawing mode is drag

    const stage = stageRef.current;
    const pointerPosition = stage.getPointerPosition();
    const layer = stage.getLayer();

    setDrawing(true);
    if (drawingMode === "text") {
      const newText = {
        x: pointerPosition.x,
        y: pointerPosition.y,
        text: "Double Click to edit",
        fontSize: 18,
        draggable: true,
      };
      setTexts([...texts, newText]);
    } else if (drawingMode === "straightLine") {
      setStartPoint(pointerPosition);
      const line = new Konva.Line({
        points: [
          pointerPosition.x,
          pointerPosition.y,
          pointerPosition.x,
          pointerPosition.y,
        ],
        stroke: "black",
        strokeWidth: 2,
        lineCap: "round",
        lineJoin: "round",
      });
      layer?.add(line);
      setStraightLines([...straightLines, line]); // Create a new line and add it to the array
    } else if (drawingMode === "rectangle") {
      const rect = new Konva.Rect({
        x: pointerPosition.x,
        y: pointerPosition.y,
        width: 0,
        height: 0,
        // fill: "blue",
        stroke: "black",
        strokeWidth: 2,
      });
      layer?.add(rect);
      setRectangles([...rectangles, rect]);
    } else if (drawingMode === "circle") {
      const circle = new Konva.Circle({
        x: pointerPosition.x,
        y: pointerPosition.y,
        radius: 0,
        // fill: "red",
        stroke: "black",
        strokeWidth: 2,
      });
      layer?.add(circle);
      setCircles([...circles, circle]);
    } else if (drawingMode === "square") {
      const square = new Konva.Rect({
        x: pointerPosition.x,
        y: pointerPosition.y,
        width: 0,
        height: 0,
        // fill: "green",
        stroke: "black",
        strokeWidth: 2,
      });
      layer?.add(square);
      setSquares([...squares, square]);
    } else if (drawingMode === "ellipse") {
      const ellipse = new Konva.Ellipse({
        x: pointerPosition.x,
        y: pointerPosition.y,
        radiusX: 0,
        radiusY: 0,
        stroke: "black",
        strokeWidth: 2,
      });
      layer?.add(ellipse);
      setEllipses([...ellipses, ellipse]);
    } else if (drawingMode === "freehand") {
      const line = new Konva.Line({
        points: [pointerPosition.x, pointerPosition.y],
        stroke: "black",
        strokeWidth: 2,
        lineCap: "round",
        lineJoin: "round",
      });
      layer?.add(line);
      setLines([...lines, line]);
    }
  };

  const handleMouseMove = () => {
    if (!drawing || isShiftPressed) return; // Ignore drawing if not active or Shift is pressed

    const stage = stageRef.current;
    const layer = stage?.getLayer();
    const pointerPosition = stage.getPointerPosition();

    if (drawing) {
      if (drawingMode === "straightLine") {
        const lastLine = straightLines[straightLines.length - 1];
        const points = [
          startPoint.x,
          startPoint.y,
          pointerPosition.x,
          pointerPosition.y,
        ];
        lastLine.points(points);
        layer?.batchDraw();
        // replace last
        setStraightLines(straightLines.concat());
      } else if (drawingMode === "rectangle") {
        const lastRect = rectangles[rectangles.length - 1];
        lastRect.width(pointerPosition.x - lastRect.x());
        lastRect.height(pointerPosition.y - lastRect.y());
        layer?.batchDraw();
        // replace last
        rectangles.splice(rectangles.length - 1, 1, lastRect);
        setRectangles(rectangles.concat());
      } else if (drawingMode === "circle") {
        const lastCircle = circles[circles.length - 1];
        const dx = pointerPosition.x - lastCircle.x();
        const dy = pointerPosition.y - lastCircle.y();
        const radius = Math.sqrt(dx * dx + dy * dy);
        lastCircle.radius(radius);
        layer?.batchDraw();
        // replace last
        circles.splice(circles.length - 1, 1, lastCircle);
        setCircles(circles.concat());
      } else if (drawingMode === "square") {
        const lastSquare = squares[squares.length - 1];
        lastSquare.width(pointerPosition.x - lastSquare.x());
        lastSquare.height(lastSquare.width());
        layer?.batchDraw();
        // replace last
        squares.splice(squares.length - 1, 1, lastSquare);
        setSquares(squares.concat());
      } else if (drawingMode === "ellipse") {
        // Add a new condition for ellipse

        const lastEllipse = ellipses[ellipses.length - 1];
        const dx = pointerPosition.x - lastEllipse.x();
        const dy = pointerPosition.y - lastEllipse.y();
        const radiusX = Math.abs(dx);
        const radiusY = Math.abs(dy);
        lastEllipse.radiusX(radiusX);
        lastEllipse.radiusY(radiusY);
        layer?.batchDraw();
        // replace last
        ellipses.splice(ellipses.length - 1, 1, lastEllipse);
        setEllipses(ellipses.concat());
      } else if (drawingMode === "freehand") {
        const lastLine = lines[lines.length - 1];
        lastLine.points(
          lastLine.points().concat([pointerPosition.x, pointerPosition.y])
        );
        layer?.batchDraw();
        // replace last
        lines.splice(lines.length - 1, 1, lastLine);
        setLines(lines.concat());
      }
    }
  };

  const handleDragStart = shape => {
    // Store the original position
    shape.attrs.originalX = shape.attrs.x;
    shape.attrs.originalY = shape.attrs.y;
  };

  const handleDragMove = (shape, e) => {
    if (isShiftPressed) {
      console.log("NEW POSITION:", e.target.x(), e.target.y());

      shape.attrs.x = e.target.x();
      shape.attrs.y = e.target.y();
    }
  };

  const handleDragEnd = (shape, e) => {
    if (!isShiftPressed) {
      // Revert to the original position
      e.target.x(shape.attrs.originalX);
      e.target.y(shape.attrs.originalY);

      // Update state to trigger re-render
      shape.attrs.x = shape.attrs.originalX;
      shape.attrs.y = shape.attrs.originalY;

      console.warn("Reverted to original position!");
    } else {
      // Update the shapes's position to the new one
      shape.attrs.x = e.target.x();
      shape.attrs.y = e.target.y();
    }
  };

  const handleUpdateText = (text, index) => {
    const newText = prompt("Edit text:", text.text);
    if (newText !== null) {
      const updatedTexts = [...texts];
      updatedTexts[index] = { ...text, text: newText };
      setTexts(updatedTexts);
    }
  };

  const handleMouseUp = () => {
    setDrawing(false);
    setStartPoint(null);
  };

  const handleSaveDrawing = () => {
    // save logics
  };

  const handleClearDrawing = () => {
    setLines([]);
    setRectangles([]);
    setCircles([]);
    setSquares([]);
    setEllipses([]);
    setStraightLines([]);
    setTexts([]);
  };

  // console.log(drawing);
  // console.log(lines);
  // console.log(rectangles);
  // console.log(circles);
  // console.log(ellipses);
  // console.log(squares);
  // console.log(straightLines);
  // console.log(texts);
  // console.log(deviceSize);

  // console.log(isMobile);

  return (
    <div className="w-full flex flex-row-reverse items-center justify-evenly p-5 h-screen bg-gray-100 relative">
      <Stage
        ref={stageRef}
        width={
          deviceSize === "max-sm"
            ? window.innerWidth - 50
            : window.innerWidth - 300
        }
        height={
          deviceSize === "max-sm"
            ? window.innerHeight - 80
            : window.innerHeight - 180
        }
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        <Layer ref={canvasRef}>
          {lines.map((line, index) => {
            return (
              <Line
                key={index}
                points={line.points()}
                stroke="black"
                strokeWidth={line.strokeWidth()}
                lineCap="round"
                lineJoin="round"
                draggable={false}
              />
            );
          })}

          {rectangles.map((rect, index) => {
            return (
              <Rect
                key={index}
                x={rect.x()}
                y={rect.y()}
                width={rect.width()}
                height={rect.height()}
                fill={rect.fill()}
                stroke={rect.stroke()}
                strokeWidth={rect.strokeWidth()}
                draggable={drawingMode === "drag"}
                onDragStart={() => handleDragStart(rect)}
                onDragMove={e => handleDragMove(rect, e)}
                onDragEnd={e => handleDragEnd(rect, e)}
              />
            );
          })}
          {circles.map((circle, index) => {
            return (
              <Circle
                key={index}
                x={circle.x()}
                y={circle.y()}
                radius={circle.radius()}
                fill={circle.fill()}
                stroke={circle.stroke()}
                strokeWidth={circle.strokeWidth()}
                draggable={drawingMode === "drag"}
                onDragStart={() => handleDragStart(circle)}
                onDragMove={e => handleDragMove(circle, e)}
                onDragEnd={e => handleDragEnd(circle, e)}
              />
            );
          })}
          {squares.map((square, index) => {
            return (
              <Rect
                key={index}
                x={square.x()}
                y={square.y()}
                width={square.width()}
                height={square.height()}
                fill={square.fill()}
                stroke={square.stroke()}
                strokeWidth={square.strokeWidth()}
                draggable={drawingMode === "drag"}
                onDragStart={() => handleDragStart(square)}
                onDragMove={e => handleDragMove(square, e)}
                onDragEnd={e => handleDragEnd(square, e)}
              />
            );
          })}
          {ellipses.map((ellipse, index) => {
            return (
              <Ellipse
                key={index}
                x={ellipse.x()}
                y={ellipse.y()}
                radiusX={ellipse.radiusX()}
                radiusY={ellipse.radiusY()}
                fill={ellipse.fill()}
                stroke={ellipse.stroke()}
                strokeWidth={ellipse.strokeWidth()}
                draggable={drawingMode === "drag"}
                onDragStart={() => handleDragStart(ellipse)}
                onDragMove={e => handleDragMove(ellipse, e)}
                onDragEnd={e => handleDragEnd(ellipse, e)}
              />
            );
          })}
          {straightLines.map((line, index) => {
            return (
              <Line
                key={index}
                points={line.points()}
                stroke="black"
                strokeWidth={line.strokeWidth()}
                lineCap="round"
                lineJoin="round"
                draggable={false}
              />
            );
          })}

          {texts.map((text, index) => (
            <Text
              key={index}
              x={text.x}
              y={text.y}
              text={text.text}
              fontSize={text.fontSize}
              fill="black"
              draggable={isShiftPressed}
              onDblClick={() => handleUpdateText(text, index)}
              onDblTap={() => handleUpdateText(text, index)}
              onDragEnd={e => {
                const updatedTexts = texts.slice();
                updatedTexts[index] = {
                  ...text,
                  x: e.target.x(),
                  y: e.target.y(),
                };
                setTexts(updatedTexts);
                console.log(texts);
              }}
            />
          ))}
        </Layer>
      </Stage>

      <div
        className="absolute left-10 top-14  border-2 size-10 rounded-md sm:hidden"
        onClick={() => setIsMobile(!isMobile)}
      >
        <IconMenu className="size-full scale-90 text-gray-600" />
      </div>
      <div
        className={`p-10 flex gap-4 flex-wrap justify-center items-center max-w-24  border border-gray-500 shadow-xl rounded-2xl max-sm:absolute duration-300 bg-white ${
          isMobile ? "left-10" : "-left-40"
        }`}
      >
        <Tooltip content="freehand" showArrow placement="right">
          <button
            className={drawingMode === "freehand" ? activeToolClass : toolClass}
            onClick={() => setDrawingMode("freehand")}
          >
            <IconSignature />
          </button>
        </Tooltip>

        <Tooltip content="line" showArrow placement="right">
          <button
            className={
              drawingMode === "straightLine" ? activeToolClass : toolClass
            }
            onClick={() => setDrawingMode("straightLine")}
          >
            <IconPencilMinus />
          </button>
        </Tooltip>

        <Tooltip content="rectangle" showArrow placement="right">
          <button
            className={
              drawingMode === "rectangle" ? activeToolClass : toolClass
            }
            onClick={() => setDrawingMode("rectangle")}
          >
            <IconRectangle className="scale-90" />
          </button>
        </Tooltip>

        <Tooltip content="circle" showArrow placement="right">
          <button
            className={drawingMode === "circle" ? activeToolClass : toolClass}
            onClick={() => setDrawingMode("circle")}
          >
            <IconCircle className="scale-95" />
          </button>
        </Tooltip>

        <Tooltip content="ellipse" showArrow placement="right">
          <button
            className={drawingMode === "ellipse" ? activeToolClass : toolClass}
            onClick={() => setDrawingMode("ellipse")}
          >
            <IconCircle className="scale-y-85" />
          </button>
        </Tooltip>

        <Tooltip content="square" showArrow placement="right">
          <button
            className={drawingMode === "square" ? activeToolClass : toolClass}
            onClick={() => setDrawingMode("square")}
          >
            <IconSquare className="scale-85" />
          </button>
        </Tooltip>

        <Tooltip content="drag (hold shift)" showArrow placement="right">
          <button
            className={drawingMode === "drag" ? activeToolClass : toolClass}
            onClick={() => setDrawingMode("drag")}
          >
            <IconHandGrab />
          </button>
        </Tooltip>

        <Tooltip content="text" showArrow placement="right">
          <button
            className={drawingMode === "text" ? activeToolClass : toolClass}
            onClick={() => setDrawingMode("text")}
          >
            <IconAlphabetLatin />
          </button>
        </Tooltip>

        <Tooltip content="clear screen" showArrow placement="right">
          <button
            className="px-2 py-1 rounded-md bg-white border border-red-700 hover:bg-red-700 text-red-700 hover:text-white hover:border-transparent mx-5 hover:bg-opacity-80 transition-all duration-300 active:scale-[1.97] hover:scale-125"
            onClick={handleClearDrawing}
          >
            <IconSquareRoundedX />
          </button>
        </Tooltip>

        <Tooltip content="save" showArrow placement="right">
          <button
            className="px-2 py-1 rounded-md bg-purple-700 text-white mx-5 hover:bg-opacity-80 transition-all duration-300 active:scale-[0.90] hover:scale-125"
            onClick={handleSaveDrawing}
          >
            <IconDeviceFloppy />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}

export default Whiteboard;
