// client/src/components/Whiteboard.js
import Konva from "konva";
import { useRef, useState } from "react";
import { Layer, Line, Stage } from "react-konva";

function Whiteboard() {
  const [drawing, setDrawing] = useState(false);
  const [lines, setLines] = useState([]);
  const canvasRef = useRef(null);
  const stageRef = useRef(null);

  const handleMouseDown = event => {
    setDrawing(true);
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
  };

  const handleMouseMove = event => {
    console.log("handleMouseMove");
    if (drawing) {
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
  };

  const handleMouseUp = () => {
    setDrawing(false);
  };

  const handleLine = () => {
    console.log("handleLine");
    const stage = stageRef.current;
    const layer = stage.getLayer();
    const line = new Konva.Line({
      points: [100, 100, 200, 200],
      stroke: "black",
      strokeWidth: 2,
      lineCap: "round",
      lineJoin: "round",
    });
    layer?.add(line);
    setLines([...lines, line]);
  };

  const handleSaveDrawing = () => {
    // save logics
  };

  console.log(drawing);
  console.log(lines);

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
        </Layer>
      </Stage>
      <div className="p-10 flex flex-wrap justify-center items-center">
        <button
          className="px-4 py-2 rounded-md bg-purple-700 text-white mx-5 hover:bg-opacity-80 transition-all duration-300 active:scale-[0.90] hover:scale-125"
          onClick={handleLine}
        >
          Line
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
