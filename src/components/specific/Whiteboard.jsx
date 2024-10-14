import { activeToolClass, toolClass } from "@/constant/constant";
import useAxiosPublic from "@/hooks/useAxiosPublic";
import useContextData from "@/hooks/useContextData";
import { handleInputChange } from "@/lib/features";
import { Button, drip, Tooltip } from "@nextui-org/react";
import {
  IconAlphabetLatin,
  IconArrowLeft,
  IconArrowsMove,
  IconArrowsMoveVertical,
  IconCircle,
  IconCursorOff,
  IconCursorText,
  IconDeviceFloppy,
  IconDownload,
  IconHandGrab,
  IconMenu,
  IconMouse,
  IconPencilMinus,
  IconPointer,
  IconRectangle,
  IconSettings,
  IconSettingsAutomation,
  IconSettingsBolt,
  IconSettingsCheck,
  IconSettingsCode,
  IconSignature,
  IconSquare,
  IconSquareRoundedX,
  IconTypography,
  IconUser,
} from "@tabler/icons-react";
import Konva from "konva";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Arrow,
  Circle,
  Ellipse,
  Group,
  Layer,
  Line,
  Rect,
  Stage,
  Text,
} from "react-konva";
import { Html } from "react-konva-utils";

function Whiteboard() {
  const {
    user,
    stroke,
    setStroke,
    color,
    setColor,
    fillColor,
    isFill,
    setIsFill,
    setFillColor,
  } = useContextData();
  const axiosPublic = useAxiosPublic();

  // console.log(user);
  // console.log(stroke, color, fillColor);

  const [deviceSize, setDeviceSize] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [inTop20, setInTop20] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [lines, setLines] = useState([]);
  const [straightLines, setStraightLines] = useState([]);
  const [rectangles, setRectangles] = useState([]);
  const [circles, setCircles] = useState([]);
  const [ellipses, setEllipses] = useState([]);
  const [arrows, setArrows] = useState([]);
  const [squares, setSquares] = useState([]);
  const [texts, setTexts] = useState([]);

  /*   console.log({
    lines,
    straightLines,
    rectangles,
    circles,
    ellipses,
    squares,
    texts,
  }); */

  const [drawing, setDrawing] = useState(false);

  const [isShiftPressed, setIsShiftPressed] = useState(false);

  const canvasRef = useRef(null);
  const stageRef = useRef(null);
  const [drawingMode, setDrawingMode] = useState("freehand");
  const [startPoint, setStartPoint] = useState(null);

  useEffect(() => {
    const handleKeyDown = event => {
      if (event.key === "Shift") {
        setIsShiftPressed(true);
        setDrawingMode("drag");
        console.log("Shift key pressed!");
      }
    };

    const handleKeyUp = event => {
      if (event.key === "Shift") {
        setIsShiftPressed(false);
        console.log("Shift keyup!");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = event => {
      const { clientY } = event;
      const windowHeight = window.innerHeight;
      const isInTop20 = clientY < windowHeight * 0.27;
      if (isInTop20 && !inTop20) {
        console.log("Cursor entered the top 20% of the window");
        setInTop20(true);
      } else if (!isInTop20 && inTop20) {
        console.log("Cursor left the top 20% of the window");
        setInTop20(false);
        // setIsSettingsOpen(false);
        // setIsProfileOpen(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [inTop20]);

  const handleResize = useCallback(() => {
    // console.log("resizing");
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
        fontSize: 36,
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
        stroke: color,
        strokeWidth: stroke,
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
        fill: isFill ? fillColor : "",
        stroke: color,
        strokeWidth: stroke,
      });
      layer?.add(rect);
      setRectangles([...rectangles, rect]);
    } else if (drawingMode === "circle") {
      const circle = new Konva.Circle({
        x: pointerPosition.x,
        y: pointerPosition.y,
        radius: 0,
        fill: isFill ? fillColor : "",
        stroke: color,
        strokeWidth: stroke,
      });
      layer?.add(circle);
      setCircles([...circles, circle]);
    } else if (drawingMode === "square") {
      const square = new Konva.Rect({
        x: pointerPosition.x,
        y: pointerPosition.y,
        width: 0,
        height: 0,
        fill: isFill ? fillColor : "",
        stroke: color,
        strokeWidth: stroke,
      });
      layer?.add(square);
      setSquares([...squares, square]);
    } else if (drawingMode === "ellipse") {
      const ellipse = new Konva.Ellipse({
        x: pointerPosition.x,
        y: pointerPosition.y,
        radiusX: 0,
        radiusY: 0,
        stroke: color,
        fill: isFill ? fillColor : "",
        strokeWidth: stroke,
      });
      layer?.add(ellipse);
      setEllipses([...ellipses, ellipse]);
    } else if (drawingMode === "arrow") {
      setStartPoint(pointerPosition);
      const arrow = new Konva.Arrow({
        x: pointerPosition.x,
        y: pointerPosition.y,
        points: [0, 0, 0, 0],
        pointerLength:
          stroke >= 10 ? stroke : stroke >= 3 ? stroke * 2 : stroke * 5,
        pointerWidth:
          stroke >= 10 ? stroke : stroke >= 3 ? stroke * 2 : stroke * 5,
        fill: isFill ? fillColor : "",
        stroke: color,
        strokeWidth: stroke,
      });
      layer?.add(arrow);
      setArrows([...arrows, arrow]);
    } else if (drawingMode === "freehand") {
      const line = new Konva.Line({
        points: [pointerPosition.x, pointerPosition.y],
        stroke: color,
        strokeWidth: stroke,
        lineCap: "round",
        lineJoin: "round",
        // dash: [33, 10], // dashed line with a length of 33px and a gap of 10px
        tension: 0.5, // smoothness of the line
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
      } else if (drawingMode === "arrow") {
        const lastArrow = arrows[arrows.length - 1];
        const points = [
          startPoint.x,
          startPoint.y,
          pointerPosition.x,
          pointerPosition.y,
        ];
        lastArrow.points(points);
        layer?.batchDraw();
        // replace last
        setArrows(arrows.concat());
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

  const handleUpdateText = (text, index, newText) => {
    console.log(text, `index is: ${index}`, newText);
    if (newText) {
      const updatedTexts = [...texts];
      updatedTexts[index] = { ...text, text: newText };
      setTexts(updatedTexts);
    }
    /* const newText = prompt("Edit text:", text.text);
    if (newText !== null) {
      const updatedTexts = [...texts];
      updatedTexts[index] = { ...text, text: newText };
      setTexts(updatedTexts);
    } */

    /* const newText = prompt("Edit text:", text.text);
    if (newText !== null) {
      const updatedTexts = [...texts];
      updatedTexts[index] = { ...text, text: newText };
      setTexts(updatedTexts);
    } */
  };

  const handleMoveTextStart = text => {
    // Store the original position
    text.originalX = text.x;
    text.originalY = text.y;
  };

  const handleMoveText = (e, text, index) => {
    if (isShiftPressed) {
      console.log("NEW POSITION:", e.target.x(), e.target.y());

      const updatedTexts = texts.slice();
      updatedTexts[index] = {
        ...text,
        x: e.target.x(),
        y: e.target.y(),
      };
      setTexts(updatedTexts);
      console.log(texts);
    }
  };

  const handleMoveTextEnd = (e, text) => {
    console.warn("Reverted to original position!");
    if (!isShiftPressed) {
      // Revert to the original position
      e.target.x(text.originalX);
      e.target.y(text.originalY);

      // Update state to trigger re-render
      text.x = text.originalX;
      text.y = text.originalY;

      console.warn("Reverted to original position!");
    } else {
      console.warn("Reverted to original position!");

      // Update the texts's position to the new one
      text.x = e.target.x();
      text.y = e.target.y();
    }
  };

  const handleMouseUp = () => {
    setDrawing(false);
    const isNotFH = drawingMode !== "freehand";
    const isNotDG = drawingMode !== "drag";
    if (isNotFH && isNotDG) setDrawingMode("pointer");

    setStartPoint(null);
  };

  const handleSaveDrawing = async () => {
    // save logics
    try {
      const data = {
        lines,
        straightLines,
        rectangles,
        circles,
        ellipses,
        squares,
        texts,
      };

      const response = await axiosPublic.post("/drawing/new", data);
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleExportDrawing = () => {
    const stage = stageRef.current;
    const dataURL = stage.toDataURL({
      mimeType: "image/png",
      quality: 1,
    });
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "drawing.png";
    link.click();
  };

  const handleClearDrawing = () => {
    setLines([]);
    setRectangles([]);
    setCircles([]);
    setSquares([]);
    setEllipses([]);
    setArrows([]);
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

  const tools = [
    {
      name: "pointer",
      mode: "pointer",
      icon: IconPointer,
    },
    {
      name: "freehand",
      mode: "freehand",
      icon: IconSignature,
    },
    {
      name: "straight line",
      mode: "straightLine",
      icon: IconPencilMinus,
    },
    {
      name: "rectangle",
      mode: "rectangle",
      icon: IconRectangle,
    },
    {
      name: "ellipse",
      mode: "ellipse",
      icon: IconCircle,
    },
    {
      name: "arrow",
      mode: "arrow",
      icon: IconArrowLeft,
    },
    {
      name: "move",
      mode: "drag",
      icon: IconArrowsMove,
    },
    {
      name: "text",
      mode: "text",
      icon: IconTypography,
    },
    {
      name: "clear screen",
      mode: "cls",
      icon: IconSquareRoundedX,
      handler: handleClearDrawing,
    },
    {
      name: "save",
      mode: "save",
      icon: IconDeviceFloppy,
      handler: handleSaveDrawing,
    },
    {
      name: "download",
      mode: "download",
      icon: IconDownload,
      handler: handleExportDrawing,
    },
  ];

  return (
    <div className="w-full flex flex-row-reverse items-center justify-evenly h-screen bg-[#121212] relative overflow-auto cursor-====kjgrab">
      <div
        hidden={!isSettingsOpen}
        onClick={() => setIsSettingsOpen(false)}
        className="absolute w-full h-screen z-50 bg-opacity-10 backdrop-blur-md"
      />
      <div
        hidden={!isProfileOpen}
        onClick={() => setIsProfileOpen(false)}
        className="absolute w-full h-screen z-50 bg-opacity-10 backdrop-blur-md"
      />
      <div
        className={`absolute text-white smax-sm:w-[90%] max-md:w-[85%] mx-2 z-50 py-1 md:py-3 px-2 sm:px-4 rounded-md bg-[#292828] flex items-center duration-300 ${
          inTop20 ? "top-5" : "-top-16"
        } `}
      >
        <Tooltip
          content="settings"
          showArrow
          placement="bottom"
          color="foreground"
        >
          <div
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`p-2 cursor-pointer hover:bg-neutral-600 rounded-lg transition ${
              isSettingsOpen && "bg-neutral-600"
            }`}
          >
            <IconSettings />
          </div>
        </Tooltip>

        <div
          className={`absolute bg-[#212020] top-16 max-w-72 p-5 rounded-lg duration-300 ${
            isSettingsOpen ? "skew-x-0 scale-1" : "skew-x-[75deg] scale-[0.0]"
          }`}
        >
          <div className="grid grid-cols-2 gap-5 ">
            <div className="flex items-center justify-between gap-2">
              <label className="w-min">Stroke</label>
              <input
                type="number"
                min="1"
                max="1000"
                value={stroke}
                onChange={e => handleInputChange(e, setStroke)}
                className="p-1 h-10 w-10 bg-neutral-700 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none"
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <label className="w-min">Stroke Color</label>
              <input
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                className="p-1 h-10 w-10 bg-neutral-700 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none"
                id="hs-color-input"
                title="Choose your color"
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <label className="w-min">Fill</label>
              <div className="overflow-hidden w-fit size-10 rounded-lg">
                <input
                  type="checkbox"
                  checked={isFill}
                  onChange={e => setIsFill(e.target.checked)}
                  className="p-1 h-10 w-10 bg-neutral-700 cursor-pointer rounded-2xl disabled:opacity-50 disabled:pointer-events-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-between gap-2">
              <label className={`w-fit transition ${!isFill && "opacity-10"}`}>
                Fill Color
              </label>
              <input
                type="color"
                value={fillColor}
                disabled={!isFill}
                onChange={e => setFillColor(e.target.value)}
                className="p-1 h-10 w-10 bg-neutral-700 cursor-pointer rounded-lg disabled:opacity-10 disabled:pointer-events-none transition"
                id="hs-color-input"
                title="Choose your color"
              />
            </div>
          </div>
        </div>

        <div className="w-[1px] h-5 bg-neutral-200 mx-2" />

        <div className="flex overflow-x-auto  gap-2 sm:gap-5">
          {tools.map(tool => {
            // console.log(tool.name);
            return (
              <Tooltip
                key={tool.name}
                content={tool.name}
                showArrow
                placement="bottom"
                color="foreground"
              >
                <div
                  onClick={() => {
                    switch (tool.mode) {
                      case "cls":
                        handleClearDrawing();
                        break;
                      case "save":
                        handleSaveDrawing();
                        break;
                      case "download":
                        handleExportDrawing();
                        break;
                      default:
                        setDrawingMode(tool.mode);
                        break;
                    }
                  }}
                  className={`p-2 cursor-pointer hover:bg-neutral-600 rounded-lg transition ${
                    tool.mode === drawingMode &&
                    "bg-[#32a852] hover:bg-[#32a852]"
                  }`}
                >
                  {<tool.icon />}
                </div>
              </Tooltip>
            );
          })}
        </div>

        <div className="w-[1px] h-5 bg-neutral-200 mx-2" />

        <Tooltip content="me" showArrow placement="bottom" color="foreground">
          <div
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={`p-2 cursor-pointer hover:bg-neutral-600 rounded-lg transition ${
              isProfileOpen && "bg-neutral-600"
            }`}
          >
            <IconUser />
          </div>
        </Tooltip>

        <div
          className={`absolute bg-[#212020] top-16 right-4 max-w-72 min-w-72 rounded-lg overflow-hidden duration-300 ${
            isProfileOpen ? "skew-x-0 scale-1" : "skew-x-[75deg] scale-[0.0]"
          }`}
        >
          <div className="">
            <div className="capitalize divide-y-1 divide-neutral-600">
              <h4 className="p-2 px-4 w-full hover:bg-neutral-700 cursor-pointer transition ">
                first option
              </h4>
              <h4 className="p-2 px-4 w-full hover:bg-neutral-700 cursor-pointer transition ">
                second option
              </h4>
              <h4 className="p-2 px-4 w-full hover:bg-neutral-700 cursor-pointer transition ">
                third option
              </h4>
              <Button className="relative w-full flex justify-center border border-transparent text-sm font-medium rounded-none text-white bg-purple-500 hover:bg-purple-600 focus:outline-none   active:scale-100 duration-300 disabled:opacity-60 uppercase focus:ring-0">
                sign in
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Stage
        ref={stageRef}
        /* width={
          deviceSize === "max-sm"
            ? window.innerWidth - 50
            window.innerWidth - 300
        }
        height={
          deviceSize === "max-sm"
            ? window.innerHeight - 80
            : window.innerHeight - 180
        } */
        width={window.innerWidth}
        height={window.innerHeight}
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
                stroke={line.stroke()}
                strokeWidth={line.strokeWidth()}
                lineCap="round"
                lineJoin="round"
                dash={line.dash()}
                tension={line.tension()}
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

          {arrows.map((arrow, index) => {
            return (
              <Arrow
                key={index}
                points={arrow.points()}
                pointerLength={arrow.pointerLength()}
                pointerWidth={arrow.pointerWidth()}
                fill={arrow.fill()}
                stroke={arrow.stroke()}
                strokeWidth={arrow.strokeWidth()}
                draggable={false}
              />
            );
          })}

          {straightLines.map((line, index) => {
            return (
              <Line
                key={index}
                points={line.points()}
                stroke={line.stroke()}
                strokeWidth={line.strokeWidth()}
                lineCap="round"
                lineJoin="round"
                draggable={false}
              />
            );
          })}

          {/* {texts.map((text, index) => (
            <Text
              key={index}
              x={text.x}
              y={text.y}
              text={text.text}
              fontSize={text.fontSize}
              fontFamily="Kalam"
              fill="white"
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
          ))} */}

          {texts.map((text, index) => (
            <EditableText
              key={index}
              text={text}
              index={index}
              drawingMode={drawingMode}
              onUpdateText={handleUpdateText}
              isShiftPressed={isShiftPressed}
              moveStart={handleMoveTextStart}
              moveHandler={handleMoveText}
              moveEnd={handleMoveTextEnd}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}

const EditableText = ({
  text,
  index,
  onUpdateText,
  isShiftPressed,
  drawingMode,
  moveStart,
  moveHandler,
  moveEnd,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newText, setNewText] = useState(text.text);
  const inputRef = useRef(null);
  const [isEnterPressed, setIsEnterPressed] = useState(false);

  useEffect(() => {
    const handleKeyDown = event => {
      if (event.key === "Enter") {
        setIsEnterPressed(true);
      }
    };

    const handleKeyUp = event => {
      if (event.key === "Enter") {
        setIsEnterPressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const handleDblClick = e => {
    setIsEditing(true);
    // inputRef?.current?.focus();
    console.log(inputRef);
    // e?.target.focus();
    console.log(e);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onUpdateText(text, index, newText);
    console.log([text, index, newText]);
  };

  const handleChange = e => {
    setNewText(e.target.value);
  };
  // console.log(isEditing);
  // console.log(text);

  return (
    <Group>
      <Text
        x={text.x}
        y={text.y}
        text={isEditing ? newText : text.text}
        fontSize={text.fontSize}
        fontFamily="Kalam"
        fill={isEditing ? "transparent" : "white"}
        draggable={drawingMode === "drag"}
        onDblClick={e => handleDblClick(e)}
        onDragStart={e => moveStart(text)}
        onDragMove={e => moveHandler(e, text, index)}
        onDragEnd={e => moveEnd(e, text)}
      />
      <Html>
        {isEditing && (
          <textarea
            ref={inputRef}
            type="text"
            value={newText}
            onChange={handleChange}
            onBlur={handleBlur}
            autoFocus
            style={{
              position: "absolute",
              top: text.y - 16,
              left: text.x - 3,
              fontSize: text.fontSize,
              fontFamily: "Kalam",
              color: "green",
              padding: 2,
              border: "1px solid black",
              zIndex: 3000,
              background: "transparent",
            }}
            className="resize min-w-max h-14"
          />
        )}
      </Html>
    </Group>
  );
};

const TextInput = ({ x, y, width, height, value, onChange, onBlur }) => {
  return (
    <Group>
      <Rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="white"
        opacity={0.5}
      />
      <Text
        x={x}
        y={y}
        text={value}
        fontSize={24}
        fontFamily="Kalam"
        fill="black"
      />
      <input
        type="text"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        style={{
          position: "absolute",
          top: y,
          left: x,
          width,
          height,
          fontSize: 24,
          fontFamily: "Kalam",
          padding: 2,
          border: "1px solid black",
        }}
      />
    </Group>
  );
};

export default Whiteboard;
