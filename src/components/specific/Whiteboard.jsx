import Konva from "konva";
import { useRef, useState } from "react";
import { Circle, Ellipse, Layer, Line, Rect, Stage } from "react-konva";

function Whiteboard() {
  const [drawing, setDrawing] = useState(false);
  const [lines, setLines] = useState([]);
  const [rectangles, setRectangles] = useState([]);
  const [squares, setSquares] = useState([]);
  const [circles, setCircles] = useState([]);
  const [ellipses, setEllipses] = useState([]); // Add a new state variable for ellipses
  const [straightLines, setStraightLines] = useState([]); // Add a new state variable for straight lines

  const canvasRef = useRef(null);
  const stageRef = useRef(null);
  const [drawingMode, setDrawingMode] = useState("freehand");
  const [startPoint, setStartPoint] = useState(null);

  const handleMouseDown = event => {
    setDrawing(true);
    if (drawingMode === "straightLine") {
      const stage = stageRef.current;
      const layer = stage.getLayer();
      const pointerPosition = stage.getPointerPosition();
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
      const stage = stageRef.current;
      const layer = stage.getLayer();
      const pointerPosition = stage.getPointerPosition();
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
      const stage = stageRef.current;
      const layer = stage.getLayer();
      const pointerPosition = stage.getPointerPosition();
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
      const stage = stageRef.current;
      const layer = stage.getLayer();
      const pointerPosition = stage.getPointerPosition();
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
      // Add a new condition for ellipse
      const stage = stageRef.current;
      const layer = stage.getLayer();
      const pointerPosition = stage.getPointerPosition();
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
    } else {
      const stage = stageRef.current;
      const layer = stage.getLayer();
      const pointerPosition = stage.getPointerPosition();
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

  const handleMouseMove = event => {
    if (drawing) {
      if (drawingMode === "straightLine") {
        const stage = stageRef.current;
        const layer = stage?.getLayer();
        const pointerPosition = stage.getPointerPosition();
        const lastLine = straightLines[straightLines.length - 1]; // Get the last line in the array
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
        const stage = stageRef.current;
        const layer = stage?.getLayer();
        const pointerPosition = stage.getPointerPosition();
        const lastRect = rectangles[rectangles.length - 1];
        lastRect.width(pointerPosition.x - lastRect.x());
        lastRect.height(pointerPosition.y - lastRect.y());
        layer?.batchDraw();
        // replace last
        rectangles.splice(rectangles.length - 1, 1, lastRect);
        setRectangles(rectangles.concat());
      } else if (drawingMode === "circle") {
        const stage = stageRef.current;
        const layer = stage?.getLayer();
        const pointerPosition = stage.getPointerPosition();
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
        const stage = stageRef.current;
        const layer = stage?.getLayer();
        const pointerPosition = stage.getPointerPosition();
        const lastSquare = squares[squares.length - 1];
        lastSquare.width(pointerPosition.x - lastSquare.x());
        lastSquare.height(lastSquare.width());
        layer?.batchDraw();
        // replace last
        squares.splice(squares.length - 1, 1, lastSquare);
        setSquares(squares.concat());
      } else if (drawingMode === "ellipse") {
        // Add a new condition for ellipse
        const stage = stageRef.current;
        const layer = stage?.getLayer();
        const pointerPosition = stage.getPointerPosition();
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
      } else {
        const stage = stageRef.current;
        const layer = stage?.getLayer();
        const pointerPosition = stage.getPointerPosition();
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

  const handleMouseUp = () => {
    setDrawing(false);
    setStartPoint(null);
  };

  const handleLine = () => {
    setDrawingMode("freehand");
  };

  const handleStraightLine = () => {
    setDrawingMode("straightLine");
  };

  const handleRectangle = () => {
    setDrawingMode("rectangle");
  };

  const handleCircle = () => {
    setDrawingMode("circle");
  };

  const handleEllipse = () => {
    setDrawingMode("ellipse");
  };

  const handleSquare = () => {
    setDrawingMode("square");
  };

  const handleSaveDrawing = () => {
    // save logics
  };

  const handleClearDrawing = () => {
    // save logics
    setLines([]);
    setRectangles([]);
    setCircles([]);
    setSquares([]);
    setEllipses([]);
    setStraightLines([]);
  };

  console.log(drawing);
  console.log(lines);
  console.log(rectangles);
  console.log(circles);
  console.log(ellipses);
  console.log(squares);
  console.log(straightLines);

  return (
    <div>
      <Stage
        ref={stageRef}
        width={window.innerWidth - 24}
        height={window.innerHeight - 24}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          border: "5px solid purple",
        }}
      >
        <Layer ref={canvasRef}>
          {lines.map((line, index) => {
            return (
              <Line
                key={index}
                points={line.points()}
                stroke="black"
                strokeWidth={2}
                lineCap="round"
                lineJoin="round"
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
              />
            );
          })}
          {ellipses.map((ellipse, index) => {
            // Add a new mapping for ellipses
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
              />
            );
          })}
          {straightLines.map((line, index) => {
            return (
              <Line
                key={index}
                points={line.points()}
                stroke="black"
                strokeWidth={2}
                lineCap="round"
                lineJoin="round"
              />
            );
          })}
        </Layer>
      </Stage>
      <div className="p-10 flex gap-4 flex-wrap justify-center items-center">
        <button
          className="px-4 py-2 rounded-md bg-purple-700 text-white mx-5 hover:bg-opacity-80 transition-all duration-300 active:scale-[0.90] hover:scale-125"
          onClick={handleLine}
        >
          Line
        </button>

        <button
          className="px-4 py-2 rounded-md bg-white border border-purple-700 hover:bg-purple-700 hover:text-white hover:border-transparent mx-5 hover:bg-opacity-80 transition-all duration-300 active:scale-[1.97] hover:scale-125"
          onClick={handleStraightLine}
        >
          Straight Line
        </button>

        <button
          className="px-4 py-2 rounded-md bg-white border border-purple-700 hover:bg-purple-700 hover:text-white hover:border-transparent mx-5 hover:bg-opacity-80 transition-all duration-300 active:scale-[1.97] hover:scale-125"
          onClick={handleRectangle}
        >
          Rectangle
        </button>

        <button
          className="px-4 py-2 rounded-md bg-white border border-purple-700 hover:bg-purple-700 hover:text-white hover:border-transparent mx-5 hover:bg-opacity-80 transition-all duration-300 active:scale-[1.97] hover:scale-125"
          onClick={handleCircle}
        >
          Circle
        </button>

        <button
          className="px-4 py-2 rounded-md bg-white border border-purple-700 hover:bg-purple-700 hover:text-white hover:border-transparent mx-5 hover:bg-opacity-80 transition-all duration-300 active:scale-[1.97] hover:scale-125"
          onClick={handleEllipse}
        >
          Ellipse
        </button>

        <button
          className="px-4 py-2 rounded-md bg-white border border-purple-700 hover:bg-purple-700 hover:text-white hover:border-transparent mx-5 hover:bg-opacity-80 transition-all duration-300 active:scale-[1.97] hover:scale-125"
          onClick={handleSquare}
        >
          Square
        </button>

        <button
          className="px-4 py-2 rounded-md bg-white border border-red-700 hover:bg-red-700 text-red-700 hover:text-white hover:border-transparent mx-5 hover:bg-opacity-80 transition-all duration-300 active:scale-[1.97] hover:scale-125"
          onClick={handleClearDrawing}
        >
          Clear Drawing
        </button>

        <button
          className="px-4 py-2 rounded-md bg-white border border-purple-700 hover:bg-purple-700 hover:text-white hover:border-transparent mx-5 hover:bg-opacity-80 transition-all duration-300 active:scale-[1.97] hover:scale-125"
          onClick={handleSaveDrawing}
        >
          Save
        </button>
      </div>
    </div>
  );
}

export default Whiteboard;
