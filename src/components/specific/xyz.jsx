// import Konva from "konva";
// import { useEffect, useRef, useState } from "react";
// import { Circle, Ellipse, Layer, Line, Rect, Stage, Text } from "react-konva";

// function Whiteboard() {
//   const [drawing, setDrawing] = useState(false);
//   const [lines, setLines] = useState([]);
//   const [rectangles, setRectangles] = useState([]);
//   const [squares, setSquares] = useState([]);
//   const [circles, setCircles] = useState([]);
//   const [ellipses, setEllipses] = useState([]); // Add a new state variable for ellipses
//   const [straightLines, setStraightLines] = useState([]); // Add a new state variable for straight lines

//   const [isShiftPressed, setIsShiftPressed] = useState(false);

//   const [isDragging, setIsDragging] = useState(false);

//   const [texts, setTexts] = useState([]); // State for text annotations

//   const canvasRef = useRef(null);
//   const stageRef = useRef(null);
//   const [drawingMode, setDrawingMode] = useState("freehand");
//   const [startPoint, setStartPoint] = useState(null);

//   useEffect(() => {
//     const handleKeyDown = event => {
//       if (event.key === "Shift") {
//         setIsShiftPressed(true);
//       }
//     };

//     const handleKeyUp = event => {
//       if (event.key === "Shift") {
//         setIsShiftPressed(false);
//       }
//     };

//     window.addEventListener("keydown", handleKeyDown);
//     window.addEventListener("keyup", handleKeyUp);

//     return () => {
//       window.removeEventListener("keydown", handleKeyDown);
//       window.removeEventListener("keyup", handleKeyUp);
//     };
//   }, []);

//   const handleMouseDown = event => {
//     if (isShiftPressed || isDragging) {
//       console.log("handleMouseDown:", isDragging);
//       return; // Ignore drawing if Shift is pressed
//     }

//     setDrawing(true);
//     if (drawingMode === "text") {
//       const stage = stageRef.current;
//       const pointerPosition = stage.getPointerPosition();
//       const newText = {
//         x: pointerPosition.x,
//         y: pointerPosition.y,
//         text: "Click to edit",
//         fontSize: 18,
//         draggable: true,
//       };
//       setTexts([...texts, newText]);
//     } else if (drawingMode === "straightLine") {
//       const stage = stageRef.current;
//       const layer = stage.getLayer();
//       const pointerPosition = stage.getPointerPosition();
//       setStartPoint(pointerPosition);
//       const line = new Konva.Line({
//         points: [
//           pointerPosition.x,
//           pointerPosition.y,
//           pointerPosition.x,
//           pointerPosition.y,
//         ],
//         stroke: "black",
//         strokeWidth: 2,
//         lineCap: "round",
//         lineJoin: "round",
//       });
//       layer?.add(line);
//       setStraightLines([...straightLines, line]); // Create a new line and add it to the array
//     } else if (drawingMode === "rectangle") {
//       const stage = stageRef.current;
//       const layer = stage.getLayer();
//       const pointerPosition = stage.getPointerPosition();
//       const rect = new Konva.Rect({
//         x: pointerPosition.x,
//         y: pointerPosition.y,
//         width: 0,
//         height: 0,
//         // fill: "blue",
//         stroke: "black",
//         strokeWidth: 2,
//       });
//       layer?.add(rect);
//       setRectangles([...rectangles, rect]);
//     } else if (drawingMode === "circle") {
//       const stage = stageRef.current;
//       const layer = stage.getLayer();
//       const pointerPosition = stage.getPointerPosition();
//       const circle = new Konva.Circle({
//         x: pointerPosition.x,
//         y: pointerPosition.y,
//         radius: 0,
//         // fill: "red",
//         stroke: "black",
//         strokeWidth: 2,
//       });
//       layer?.add(circle);
//       setCircles([...circles, circle]);
//     } else if (drawingMode === "square") {
//       const stage = stageRef.current;
//       const layer = stage.getLayer();
//       const pointerPosition = stage.getPointerPosition();
//       const square = new Konva.Rect({
//         x: pointerPosition.x,
//         y: pointerPosition.y,
//         width: 0,
//         height: 0,
//         // fill: "green",
//         stroke: "black",
//         strokeWidth: 2,
//       });
//       layer?.add(square);
//       setSquares([...squares, square]);
//     } else if (drawingMode === "ellipse") {
//       // Add a new condition for ellipse
//       const stage = stageRef.current;
//       const layer = stage.getLayer();
//       const pointerPosition = stage.getPointerPosition();
//       const ellipse = new Konva.Ellipse({
//         x: pointerPosition.x,
//         y: pointerPosition.y,
//         radiusX: 0,
//         radiusY: 0,
//         stroke: "black",
//         strokeWidth: 2,
//       });
//       layer?.add(ellipse);
//       setEllipses([...ellipses, ellipse]);
//     } else {
//       const stage = stageRef.current;
//       const layer = stage.getLayer();
//       const pointerPosition = stage.getPointerPosition();
//       const line = new Konva.Line({
//         points: [pointerPosition.x, pointerPosition.y],
//         stroke: "black",
//         strokeWidth: 2,
//         lineCap: "round",
//         lineJoin: "round",
//       });
//       layer?.add(line);
//       setLines([...lines, line]);
//     }
//   };

//   const handleMouseMove = event => {
//     if (!drawing || isShiftPressed) return; // Ignore drawing if not active or Shift is pressed

//     if (drawing) {
//       if (drawingMode === "straightLine") {
//         const stage = stageRef.current;
//         const layer = stage?.getLayer();
//         const pointerPosition = stage.getPointerPosition();
//         const lastLine = straightLines[straightLines.length - 1];
//         const points = [
//           startPoint.x,
//           startPoint.y,
//           pointerPosition.x,
//           pointerPosition.y,
//         ];
//         lastLine.points(points);
//         layer?.batchDraw();
//         // replace last
//         setStraightLines(straightLines.concat());
//       } else if (drawingMode === "rectangle") {
//         const stage = stageRef.current;
//         const layer = stage?.getLayer();
//         const pointerPosition = stage.getPointerPosition();
//         const lastRect = rectangles[rectangles.length - 1];
//         lastRect.width(pointerPosition.x - lastRect.x());
//         lastRect.height(pointerPosition.y - lastRect.y());
//         layer?.batchDraw();
//         // replace last
//         rectangles.splice(rectangles.length - 1, 1, lastRect);
//         setRectangles(rectangles.concat());
//       } else if (drawingMode === "circle") {
//         const stage = stageRef.current;
//         const layer = stage?.getLayer();
//         const pointerPosition = stage.getPointerPosition();
//         const lastCircle = circles[circles.length - 1];
//         const dx = pointerPosition.x - lastCircle.x();
//         const dy = pointerPosition.y - lastCircle.y();
//         const radius = Math.sqrt(dx * dx + dy * dy);
//         lastCircle.radius(radius);
//         layer?.batchDraw();
//         // replace last
//         circles.splice(circles.length - 1, 1, lastCircle);
//         setCircles(circles.concat());
//       } else if (drawingMode === "square") {
//         const stage = stageRef.current;
//         const layer = stage?.getLayer();
//         const pointerPosition = stage.getPointerPosition();
//         const lastSquare = squares[squares.length - 1];
//         lastSquare.width(pointerPosition.x - lastSquare.x());
//         lastSquare.height(lastSquare.width());
//         layer?.batchDraw();
//         // replace last
//         squares.splice(squares.length - 1, 1, lastSquare);
//         setSquares(squares.concat());
//       } else if (drawingMode === "ellipse") {
//         // Add a new condition for ellipse
//         const stage = stageRef.current;
//         const layer = stage?.getLayer();
//         const pointerPosition = stage.getPointerPosition();
//         const lastEllipse = ellipses[ellipses.length - 1];
//         const dx = pointerPosition.x - lastEllipse.x();
//         const dy = pointerPosition.y - lastEllipse.y();
//         const radiusX = Math.abs(dx);
//         const radiusY = Math.abs(dy);
//         lastEllipse.radiusX(radiusX);
//         lastEllipse.radiusY(radiusY);
//         layer?.batchDraw();
//         // replace last
//         ellipses.splice(ellipses.length - 1, 1, lastEllipse);
//         setEllipses(ellipses.concat());
//       } else {
//         const stage = stageRef.current;
//         const layer = stage?.getLayer();
//         const pointerPosition = stage.getPointerPosition();
//         const lastLine = lines[lines.length - 1];
//         lastLine.points(
//           lastLine.points().concat([pointerPosition.x, pointerPosition.y])
//         );
//         layer?.batchDraw();
//         // replace last
//         lines.splice(lines.length - 1, 1, lastLine);
//         setLines(lines.concat());
//       }
//     }
//   };

//   const handleMouseUp = () => {
//     setDrawing(false);
//     setStartPoint(null);
//   };

//   const handleLine = () => {
//     setDrawingMode("freehand");
//   };

//   const handleStraightLine = () => {
//     setDrawingMode("straightLine");
//   };

//   const handleRectangle = () => {
//     setDrawingMode("rectangle");
//   };

//   const handleCircle = () => {
//     setDrawingMode("circle");
//   };

//   const handleEllipse = () => {
//     setDrawingMode("ellipse");
//   };

//   const handleRectDragStart = rect => {
//     setIsDragging(true);
//     console.log("dragging is true!");

//     // Store the original position
//     rect.attrs.originalX = rect.attrs.x;
//     rect.attrs.originalY = rect.attrs.y;
//   };

//   const handleSquare = () => {
//     setDrawingMode("square");
//   };

//   const handleSaveDrawing = () => {
//     // save logics
//   };

//   const handleClearDrawing = () => {
//     setLines([]);
//     setRectangles([]);
//     setCircles([]);
//     setSquares([]);
//     setEllipses([]);
//     setStraightLines([]);
//     setTexts([]); // Clear text annotations
//   };

//   // console.log(drawing);
//   // console.log(lines);
//   // console.log(rectangles);
//   // console.log(circles);
//   // console.log(ellipses);
//   // console.log(squares);
//   // console.log(straightLines);
//   // console.log(texts);
//   // console.log("SHIFT: ", isShiftPressed);
//   console.log("isDragging: ", isDragging);

//   return (
//     <div>
//       <Stage
//         ref={stageRef}
//         width={window.innerWidth - 24}
//         height={window.innerHeight - 180}
//         onMouseDown={handleMouseDown}
//         onMouseMove={handleMouseMove}
//         onMouseUp={handleMouseUp}
//         style={{
//           border: "5px solid purple",
//         }}
//       >
//         <Layer ref={canvasRef}>
//           {lines.map((line, index) => {
//             return (
//               <Line
//                 key={index}
//                 points={line.points()}
//                 stroke="black"
//                 strokeWidth={2}
//                 lineCap="round"
//                 lineJoin="round"
//               />
//             );
//           })}
//           {/* <Rect
//               key={index}
//               x={rect.attrs.x}
//               y={rect.attrs.y}
//               width={rect.width()}
//               height={rect.height()}
//               fill={rect.fill()}
//               stroke={rect.stroke()}
//               strokeWidth={rect.strokeWidth()}
//               draggable={isShiftPressed}
//               onDragMove={e => {
//                 if (isShiftPressed) {
//                   console.log(
//                     "OLD POSITION:",
//                     rectangles[index].attrs.x,
//                     rectangles[index].attrs.y,
//                     "NEW POSITION:",
//                     e.target.x(),
//                     e.target.y()
//                   );

//                   rectangles[index].attrs.x = e.target.x();
//                   rectangles[index].attrs.y = e.target.y();
//                 } else {
//                   console.warn("revert position!");
//                 }
//               }}
//               onDragEnd={e => {
//                 if (isShiftPressed) {
//                   console.log(
//                     "OLD POSITION:",
//                     rectangles[index].attrs.x,
//                     rectangles[index].attrs.y,
//                     "NEW POSITION:",
//                     e.target.x(),
//                     e.target.y()
//                   );

//                   rectangles[index].attrs.x = e.target.x();
//                   rectangles[index].attrs.y = e.target.y();
//                 } else {
//                   console.warn("revert position!");
//                 }
//               }}
//             /> */}
//           {rectangles.map((rect, index) => {
//             return (
//               <Rect
//                 key={index}
//                 x={rect.attrs.x}
//                 y={rect.attrs.y}
//                 width={rect.width()}
//                 height={rect.height()}
//                 fill={rect.fill()}
//                 stroke={rect.stroke()}
//                 strokeWidth={rect.strokeWidth()}
//                 draggable={true} // Always draggable to allow drag events
//                 onDragStart={() => handleRectDragStart(rect)}
//                 onDragMove={e => {
//                   if (isShiftPressed) {
//                     console.log(
//                       "OLD POSITION:",
//                       rectangles[index].attrs.x,
//                       rectangles[index].attrs.y,
//                       "NEW POSITION:",
//                       e.target.x(),
//                       e.target.y()
//                     );

//                     rectangles[index].attrs.x = e.target.x();
//                     rectangles[index].attrs.y = e.target.y();
//                   }
//                 }}
//                 onDragEnd={e => {
//                   if (!isShiftPressed) {
//                     // Revert to the original position
//                     e.target.x(rect.attrs.originalX);
//                     e.target.y(rect.attrs.originalY);

//                     // Update state to trigger re-render
//                     rectangles[index].attrs.x = rect.attrs.originalX;
//                     rectangles[index].attrs.y = rect.attrs.originalY;
//                     setRectangles([...rectangles]);
//                     setIsDragging(false);

//                     console.warn("Reverted to original position!");
//                   } else {
//                     // Update the rectangle's position to the new one
//                     rectangles[index].attrs.x = e.target.x();
//                     rectangles[index].attrs.y = e.target.y();
//                     setRectangles([...rectangles]);
//                     setIsDragging(false);
//                   }
//                   setIsDragging(false);
//                 }}
//               />
//             );
//           })}
//           {circles.map((circle, index) => {
//             return (
//               <Circle
//                 key={index}
//                 x={circle.x()}
//                 y={circle.y()}
//                 radius={circle.radius()}
//                 fill={circle.fill()}
//                 stroke={circle.stroke()}
//                 strokeWidth={circle.strokeWidth()}
//                 draggable={isShiftPressed}
//                 onDragEnd={e => {
//                   if (isShiftPressed) {
//                     console.log(
//                       "OLD POSITION:",
//                       circles[index].attrs.x,
//                       circles[index].attrs.y,
//                       "NEW POSITION:",
//                       e.target.x(),
//                       e.target.y()
//                     );

//                     circles[index].attrs.x = e.target.x();
//                     circles[index].attrs.y = e.target.y();
//                   }
//                 }}
//               />
//             );
//           })}
//           {squares.map((square, index) => {
//             return (
//               <Rect
//                 key={index}
//                 x={square.x()}
//                 y={square.y()}
//                 width={square.width()}
//                 height={square.height()}
//                 fill={square.fill()}
//                 stroke={square.stroke()}
//                 strokeWidth={square.strokeWidth()}
//               />
//             );
//           })}
//           {ellipses.map((ellipse, index) => {
//             return (
//               <Ellipse
//                 key={index}
//                 x={ellipse.x()}
//                 y={ellipse.y()}
//                 radiusX={ellipse.radiusX()}
//                 radiusY={ellipse.radiusY()}
//                 fill={ellipse.fill()}
//                 stroke={ellipse.stroke()}
//                 strokeWidth={ellipse.strokeWidth()}
//               />
//             );
//           })}
//           {straightLines.map((line, index) => {
//             return (
//               <Line
//                 key={index}
//                 points={line.points()}
//                 stroke="black"
//                 strokeWidth={2}
//                 lineCap="round"
//                 lineJoin="round"
//               />
//             );
//           })}

//           {texts.map((text, index) => (
//             <Text
//               key={index}
//               x={text.x}
//               y={text.y}
//               text={text.text}
//               fontSize={text.fontSize}
//               fill="black"
//               draggable={isShiftPressed}
//               onDblClick={() => {
//                 const newText = prompt("Edit text:", text.text);
//                 if (newText !== null) {
//                   const updatedTexts = [...texts];
//                   updatedTexts[index] = { ...text, text: newText };
//                   setTexts(updatedTexts);
//                 }
//               }}
//               onDragEnd={e => {
//                 const updatedTexts = texts.slice();
//                 updatedTexts[index] = {
//                   ...text,
//                   x: e.target.x(),
//                   y: e.target.y(),
//                 };
//                 setTexts(updatedTexts);
//                 console.log(texts);
//               }}
//             />
//           ))}
//         </Layer>
//       </Stage>
//       <div className="p-10 flex gap-4 flex-wrap justify-center items-center">
//         <button
//           className="px-4 py-2 rounded-md bg-purple-700 text-white mx-5 hover:bg-opacity-80 transition-all duration-300 active:scale-[0.90] hover:scale-125"
//           onClick={handleLine}
//         >
//           Line
//         </button>

//         <button
//           className="px-4 py-2 rounded-md bg-white border border-purple-700 hover:bg-purple-700 hover:text-white hover:border-transparent mx-5 hover:bg-opacity-80 transition-all duration-300 active:scale-[1.97] hover:scale-125"
//           onClick={handleStraightLine}
//         >
//           Straight Line
//         </button>

//         <button
//           className="px-4 py-2 rounded-md bg-white border border-purple-700 hover:bg-purple-700 hover:text-white hover:border-transparent mx-5 hover:bg-opacity-80 transition-all duration-300 active:scale-[1.97] hover:scale-125"
//           onClick={handleRectangle}
//         >
//           Rectangle
//         </button>

//         <button
//           className="px-4 py-2 rounded-md bg-white border border-purple-700 hover:bg-purple-700 hover:text-white hover:border-transparent mx-5 hover:bg-opacity-80 transition-all duration-300 active:scale-[1.97] hover:scale-125"
//           onClick={handleCircle}
//         >
//           Circle
//         </button>

//         <button
//           className="px-4 py-2 rounded-md bg-white border border-purple-700 hover:bg-purple-700 hover:text-white hover:border-transparent mx-5 hover:bg-opacity-80 transition-all duration-300 active:scale-[1.97] hover:scale-125"
//           onClick={handleEllipse}
//         >
//           Ellipse
//         </button>

//         <button
//           className="px-4 py-2 rounded-md bg-white border border-purple-700 hover:bg-purple-700 hover:text-white hover:border-transparent mx-5 hover:bg-opacity-80 transition-all duration-300 active:scale-[1.97] hover:scale-125"
//           onClick={handleSquare}
//         >
//           Square
//         </button>

//         <button
//           className="px-4 py-2 rounded-md bg-white border border-purple-700 hover:bg-purple-700 hover:text-white hover:border-transparent mx-5 hover:bg-opacity-80 transition-all duration-300 active:scale-[1.97] hover:scale-125"
//           onClick={() => setDrawingMode("text")}
//         >
//           Text
//         </button>

//         <button
//           className="px-4 py-2 rounded-md bg-white border border-red-700 hover:bg-red-700 text-red-700 hover:text-white hover:border-transparent mx-5 hover:bg-opacity-80 transition-all duration-300 active:scale-[1.97] hover:scale-125"
//           onClick={handleClearDrawing}
//         >
//           Clear Drawing
//         </button>

//         <button
//           className="px-4 py-2 rounded-md bg-white border border-purple-700 hover:bg-purple-700 hover:text-white hover:border-transparent mx-5 hover:bg-opacity-80 transition-all duration-300 active:scale-[1.97] hover:scale-125"
//           onClick={handleSaveDrawing}
//         >
//           Save
//         </button>
//       </div>
//     </div>
//   );
// }

// export default Whiteboard;
