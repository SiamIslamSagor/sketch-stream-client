import useAxiosPublic from "@/hooks/useAxiosPublic";
import useContextData from "@/hooks/useContextData";
import { handleInputChange } from "@/lib/features";
import { cn } from "@/lib/utils";
import { Avatar, Button, Tooltip } from "@nextui-org/react";
import {
  IconArrowsMove,
  IconCircle,
  IconDeviceFloppy,
  IconDownload,
  IconEraser,
  IconPointer,
  IconRectangle,
  IconSettings,
  IconSquareRoundedX,
  IconTypography,
  IconUser,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import Konva from "konva";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Arrow,
  Ellipse,
  Group,
  Layer,
  Line,
  Rect,
  Stage,
  Text,
  Transformer,
} from "react-konva";
import { Html } from "react-konva-utils";
import AuthModal from "../auth/AuthModal";

function Whiteboard() {
  const {
    user,
    logOut,
    stroke,
    setStroke,
    color,
    setColor,
    fillColor,
    isFill,
    setIsFill,
    setFillColor,
    fontSize,
    setFontSize,
    fontColor,
    setFontColor,
  } = useContextData();
  const axiosPublic = useAxiosPublic();

  // console.log(user);
  // console.log(stroke, color, fillColor);

  const [deviceSize, setDeviceSize] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 100, y: 200 });
  const [inTop20, setInTop20] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const [lines, setLines] = useState([]);
  const [straightLines, setStraightLines] = useState([]);
  const [rectangles, setRectangles] = useState([]);
  const [circles, setCircles] = useState([]);
  const [ellipses, setEllipses] = useState([]);
  const [arrows, setArrows] = useState([]);
  const [squares, setSquares] = useState([]);
  const [texts, setTexts] = useState([]);

  const [selectionRect, setSelectionRect] = useState({
    visible: false,
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
  });

  // const [selectedNode, setSelectedNode] = useState(null);

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
  const transformerRef = useRef(null);
  const selectionRectRef = useRef(null);

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
        setInTop20(true);
      } else if (!isInTop20 && inTop20) {
        setInTop20(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [inTop20]);

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

  const handleMouseDown = e => {
    if (drawingMode === "pointer") {
      if (e.target !== e.target.getStage()) {
        return;
      }
      e.evt.preventDefault();
      const { x, y } = stageRef.current.getPointerPosition();
      setSelectionRect({
        visible: true,
        x1: x,
        y1: y,
        x2: x,
        y2: y,
      });
    }

    // console.log("mouse down");
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
        fontSize,
        fill: fontColor,
        draggable: true,
      };
      setTexts([...texts, newText]);
    } else if (drawingMode === "straightLine") {
      setStartPoint(pointerPosition);
      const line = new Konva.Line({
        x: pointerPosition.x,
        y: pointerPosition.y,
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
    } else if (drawingMode === "freehand" || drawingMode === "erase") {
      const line = new Konva.Line({
        x: pointerPosition.x,
        y: pointerPosition.y,
        points: [pointerPosition.x, pointerPosition.y],
        stroke: color,
        strokeWidth: stroke,
        lineCap: "round",
        lineJoin: "round",
        closed: isFill,
        fill: fillColor,
        // dash: [33, 10], // dashed line with a length of 33px and a gap of 10px
        tension: 0.5, // smoothness of the line
        globalCompositeOperation:
          drawingMode === "erase" ? "destination-out" : "source-over",
      });
      layer?.add(line);
      setLines([...lines, line]);
    }
  };

  const handleMouseMove = e => {
    if (drawingMode === "pointer") {
      if (!selectionRect.visible) {
        return;
      }
      e.evt.preventDefault();
      const { x, y } = stageRef.current.getPointerPosition();
      setSelectionRect(prev => ({
        ...prev,
        x2: x,
        y2: y,
      }));
    }

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
      } else if (drawingMode === "freehand" || drawingMode === "erase") {
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

  const handleMouseUp = e => {
    setDrawing(false);
    setStartPoint(null);
    if (drawingMode === "pointer") {
      if (!selectionRect.visible) {
        return;
      }
      e.evt.preventDefault();
      const shapes = stageRef.current.find(
        ".circle, .rect, .line, .text, .arrow"
      );
      // console.log(shapes);
      const box = selectionRectRef?.current.getClientRect();

      const selected = shapes.filter(shape =>
        Konva.Util.haveIntersection(box, shape.getClientRect())
      );

      transformerRef.current.nodes(selected);
      setSelectionRect({ visible: false, x1: 0, y1: 0, x2: 0, y2: 0 });
    } else {
      const isNotFH = drawingMode !== "freehand";
      const isNotER = drawingMode !== "erase";
      const isNotDG = drawingMode !== "drag";
      if (isNotFH && isNotDG && isNotER) setDrawingMode("pointer");
    }
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
    const dataURL = stage.toDataURL({ pixelRatio: 3 });
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "drawing.png";
    link.click();
    document.body.removeChild(link);
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

  const handleStgClick = e => {
    if (e.target.getClassName() === "Stage") {
      setIsMenuOpen(false);
      // next line not working
      transformerRef.current.nodes([]); // Deselect all shapes
      return;
    }

    if (selectionRect.visible) {
      return; // If we are selecting with rect, do nothing
    }

    const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
    const isSelected = transformerRef.current.nodes().indexOf(e.target) >= 0;

    if (!metaPressed && !isSelected) {
      transformerRef.current.nodes([e.target]); // Select just one
    } else if (metaPressed && isSelected) {
      const nodes = transformerRef.current.nodes().slice();
      nodes.splice(nodes.indexOf(e.target), 1); // Remove node from selection
      transformerRef.current.nodes(nodes);
    } else if (metaPressed && !isSelected) {
      const nodes = transformerRef.current.nodes().concat([e.target]); // Add the node into selection
      transformerRef.current.nodes(nodes);
    }
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
      name: "cursor (v)",
      mode: "pointer",
      icon: IconPointer,
    },
    {
      name: "pencil (p)",
      mode: "freehand",
      // icon: IconPencil,
      el: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M20.07 3.456a3.135 3.135 0 0 0-4.434 0L10.25 8.843a3.38 3.38 0 0 0-.884 1.55l-.845 3.292c-.205.8.522 1.527 1.322 1.323l3.278-.837a3.384 3.384 0 0 0 1.555-.886L20.07 7.89a3.135 3.135 0 0 0 0-4.434Zm-2.117 4.43 1.057-1.057a1.635 1.635 0 0 0-2.313-2.313l-1.056 1.057 2.312 2.312Zm-1.166 1.166-3.172 3.172c-.24.24-.539.41-.866.493l-2.602.665.67-2.616a1.88 1.88 0 0 1 .492-.862l3.165-3.164 2.313 2.312Z"
            fill="currentColor"
          ></path>
          <path
            d="M5.144 15.022a.641.641 0 1 0 0 1.282h13.751a2.109 2.109 0 0 1 0 4.218H9.194a.75.75 0 0 1 0-1.5h9.701a.609.609 0 1 0 0-1.218H5.144a2.141 2.141 0 0 1 0-4.282h1.862v1.5H5.144Z"
            fill="currentColor"
          ></path>
        </svg>
      ),
    },
    {
      name: "eraser (e)",
      mode: "erase",
      icon: IconEraser,
    },
    {
      name: "line (l)",
      mode: "straightLine",
      el: <div className="w-6 h-[3px] bg-white rounded-full" />,
    },
    {
      name: "rectangle (r)",
      mode: "rectangle",
      icon: IconRectangle,
    },
    {
      name: "ellipse (c)",
      mode: "ellipse",
      icon: IconCircle,
    },
    {
      name: "arrow (a)",
      mode: "arrow",
      el: (
        <svg
          stroke="currentColor"
          fill="currentColor"
          strokeWidth="0"
          viewBox="0 0 448 512"
          height="1.5em"
          width="1.5em"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M134.059 296H436c6.627 0 12-5.373 12-12v-56c0-6.627-5.373-12-12-12H134.059v-46.059c0-21.382-25.851-32.09-40.971-16.971L7.029 239.029c-9.373 9.373-9.373 24.569 0 33.941l86.059 86.059c15.119 15.119 40.971 4.411 40.971-16.971V296z"></path>
        </svg>
      ),
    },
    {
      name: "text (t)",
      mode: "text",
      icon: IconTypography,
    },
    {
      name: "move (shift+move)",
      mode: "drag",
      icon: IconArrowsMove,
    },
    {
      name: "clear screen (ctrl+backspace)",
      mode: "cls",
      icon: IconSquareRoundedX,
      handler: handleClearDrawing,
    },
    {
      name: "save (ctrl+s)",
      mode: "save",
      icon: IconDeviceFloppy,
      handler: handleSaveDrawing,
    },
    {
      name: "download (ctrl+d)",
      mode: "download",
      icon: IconDownload,
      handler: handleExportDrawing,
    },
  ];

  const handleKeyDown = useCallback(
    event => {
      const { key, ctrlKey, shiftKey } = event;
      const isSpecial = ctrlKey || shiftKey;
      const shortcutKey = key.toLowerCase();

      // console.time("timer");

      const drawingShortcuts = {
        v: "pointer",
        p: "freehand",
        l: "straightLine",
        r: "rectangle",
        c: "ellipse",
        a: "arrow",
        t: "text",
        e: "erase",
      };

      const specialShortcuts = {
        d: handleExportDrawing,
        backspace: handleClearDrawing,
        s: handleSaveDrawing,
        ",": () => setIsSettingsOpen(true),
        p: () => setIsProfileOpen(true),
      };

      // Handle drawing mode change
      if (
        !isSpecial &&
        drawingShortcuts[shortcutKey] &&
        drawingMode !== drawingShortcuts[shortcutKey]
      ) {
        setDrawingMode(drawingShortcuts[shortcutKey]);
      }

      // Handle special key combinations (Ctrl + key)
      if (isSpecial && ctrlKey && specialShortcuts[shortcutKey]) {
        event.preventDefault();
        specialShortcuts[shortcutKey]();
      }

      // console.timeEnd("timer");
    },
    [
      drawingMode,
      setDrawingMode,
      handleExportDrawing,
      handleClearDrawing,
      handleSaveDrawing,
      setIsSettingsOpen,
      setIsProfileOpen,
    ]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // console.log(lines);

  // console.log(isStrokeChanging);
  return (
    <div
      // onContextMenu={e => setIsMenuOpen(false)}
      className={`w-full flex flex-row-reverse items-center justify-evenly h-screen bg-[#121212] relative overflow-auto ${
        drawingMode === "pointer"
          ? "cursor-default"
          : drawingMode === "drag"
          ? "cursor-move"
          : drawingMode === "text"
          ? "cursor-text"
          : "cursor-crosshair"
      }`}
    >
      {isAuthOpen && <AuthModal setIsAuthOpen={setIsAuthOpen} />}

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: 20,
              }}
              transition={{ duration: 0.15 }}
              className={`absolute bg-[#292828]   max-w-72 min-w-72 rounded-lg overflow-hidden duration-300 z-[55] text-white`}
              style={{
                top: menuPosition.y,
                left: menuPosition.x,
              }}
            >
              <div className="">
                <div className="capitalize divide-y-1 divide-neutral-600">
                  <h4 className="flex items- gap-2 font-mono p-4 w-full hover:bg-neutral-700 cursor-pointer transition ">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="currentColor"
                        d="M12.75 5.82v8.43a.75.75 0 1 1-1.5 0V5.81L8.99 8.07A.75.75 0 1 1 7.93 7l2.83-2.83a1.75 1.75 0 0 1 2.47 0L16.06 7A.75.75 0 0 1 15 8.07l-2.25-2.25zM15 10.48l6.18 3.04a1 1 0 0 1 0 1.79l-7.86 3.86a3 3 0 0 1-2.64 0l-7.86-3.86a1 1 0 0 1 0-1.8L9 10.49v1.67L4.4 14.4l6.94 3.42c.42.2.9.2 1.32 0l6.94-3.42-4.6-2.26v-1.67z"
                      ></path>
                    </svg>{" "}
                    send to up
                  </h4>
                  <h4 className="flex items- gap-2 font-mono p-4 w-full hover:bg-neutral-700 cursor-pointer transition ">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="currentColor"
                        d="M12.75 3.82v9.43a.75.75 0 1 1-1.5 0V3.81L8.99 6.07A.75.75 0 1 1 7.93 5l2.83-2.83a1.75 1.75 0 0 1 2.47 0L16.06 5A.75.75 0 0 1 15 6.07l-2.25-2.25zM15 8.48l6.18 3.04a1 1 0 0 1 0 1.79l-7.86 3.86a3 3 0 0 1-2.64 0l-7.86-3.86a1 1 0 0 1 0-1.8L9 8.49v1.67L4.4 12.4l6.94 3.42c.42.2.9.2 1.32 0l6.94-3.42-4.6-2.26V8.48zm4.48 7.34 1.7.83a1 1 0 0 1 0 1.8l-7.86 3.86a3 3 0 0 1-2.64 0l-7.86-3.86a1 1 0 0 1 0-1.8l1.7-.83 1.7.83-1.82.9 6.94 3.41c.42.2.9.2 1.32 0l6.94-3.41-1.82-.9 1.7-.83z"
                      ></path>
                    </svg>{" "}
                    send to front{" "}
                  </h4>
                  <h4 className="flex items- gap-2 font-mono p-4 w-full hover:bg-neutral-700 cursor-pointer transition ">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="currentColor"
                        d="M12.75 18.12V9.75a.75.75 0 1 0-1.5 0v8.37l-2.26-2.25a.75.75 0 0 0-1.06 1.06l2.83 2.82c.68.69 1.79.69 2.47 0l2.83-2.82A.75.75 0 0 0 15 15.87l-2.25 2.25zM15 11.85v1.67l6.18-3.04a1 1 0 0 0 0-1.79l-7.86-3.86a3 3 0 0 0-2.64 0L2.82 8.69a1 1 0 0 0 0 1.8L9 13.51v-1.67L4.4 9.6l6.94-3.42c.42-.2.9-.2 1.32 0L19.6 9.6 15 11.85z"
                      ></path>
                    </svg>{" "}
                    send to down
                  </h4>
                  <h4 className="flex items- gap-2 font-mono p-4 w-full hover:bg-neutral-700 cursor-pointer transition ">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="currentColor"
                        d="m19.48 10.82 1.7.83a1 1 0 0 1 0 1.8L15 16.49V14.8l4.6-2.26-1.82-.9 1.7-.83zm-14.96 0-1.7.83a1 1 0 0 0 0 1.8L9 16.49V14.8l-4.6-2.26 1.82-.9-1.7-.83zm8.23 9.5L15 18.07a.75.75 0 0 1 1.06 1.06l-2.83 2.83c-.68.68-1.79.68-2.47 0l-2.83-2.83a.75.75 0 0 1 1.06-1.06l2.26 2.26V6.9a.75.75 0 1 1 1.5 0v13.43zM15 11.35V9.68l4.6-2.27L12.66 4c-.42-.2-.9-.2-1.32 0L4.4 7.4 9 9.68v1.67L2.82 8.3a1 1 0 0 1 0-1.8l7.86-3.86a3 3 0 0 1 2.64 0l7.86 3.87a1 1 0 0 1 0 1.79L15 11.35z"
                      ></path>
                    </svg>{" "}
                    send to back{" "}
                  </h4>
                  <h4 className="flex items- gap-2 font-mono p-4 w-full hover:bg-red-100 hover:bg-opacity-90 hover:text-red-700 cursor-pointer transition ">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="currentColor"
                        d="M8 5a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3h4.25a.75.75 0 1 1 0 1.5H19V18a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V6.5H3.75a.75.75 0 0 1 0-1.5H8zM6.5 6.5V18c0 .83.67 1.5 1.5 1.5h8c.83 0 1.5-.67 1.5-1.5V6.5h-11zm3-1.5h5c0-.83-.67-1.5-1.5-1.5h-2c-.83 0-1.5.67-1.5 1.5zm-.25 4h1.5v8h-1.5V9zm4 0h1.5v8h-1.5V9z"
                      ></path>
                    </svg>
                    delete drawing{" "}
                  </h4>
                </div>
              </div>
            </motion.div>
          </>
        )}{" "}
      </AnimatePresence>

      <div
        hidden={!isSettingsOpen}
        onClick={() => setIsSettingsOpen(false)}
        className="absolute w-full h-screen z-50 bg-opacity-10 backdrop-blur-md"
      >
        {drawingMode === "freehand" && (
          <div
            className={cn(
              "rounded-full size-10 duration-150  bg-green-500 absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
            )}
            style={{
              height: stroke,
              width: stroke,
              backgroundColor: color,
            }}
          />
        )}
        {drawingMode === "text" && (
          <div
            className={cn(
              "rounded-full duration-150 absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
            )}
          >
            <h1
              style={{
                fontSize,
                color: fontColor,
              }}
            >
              Aa
            </h1>
          </div>
        )}
      </div>

      <div
        hidden={!isProfileOpen}
        onClick={() => setIsProfileOpen(false)}
        className="absolute w-full h-screen z-[500] bg-opacity-10 backdrop-blur-md"
      />
      <div
        className={`fixed text-white max-sm:w-[90%] max-md:w-[85%] mx-2 z-[500000] py-1 md:py-3 px-2 sm:px-4 rounded-md bg-[#292828] flex items-center duration-300 delay-1000 ${
          // inTop20 ? "top-5" : "-top-16"
          "top-5"
        } `}
      >
        <Tooltip
          content="settings (ctrl+,)"
          showArrow
          placement="bottom"
          color="foreground"
          style={{
            fontFamily: "monospace",
          }}
        >
          <div
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`p-2 cursor-pointer hover:bg-neutral-600 rounded-lg transition ${
              isSettingsOpen && "bg-neutral-600"
            }`}
          >
            <IconSettings
              className={`duration-300 ${isSettingsOpen && "rotate-45"}`}
            />
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
            <div className="flex items-center justify-between gap-2">
              <label className="w-min">Font Size</label>
              <input
                type="number"
                min="16"
                max="1000"
                value={fontSize}
                onChange={e => handleInputChange(e, setFontSize, 16, 1000)}
                className="p-1 h-10 w-10 bg-neutral-700 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none"
              />
            </div>{" "}
            <div className="flex items-center justify-between gap-2">
              <label className="w-min">Font Color</label>
              <input
                type="color"
                value={fontColor}
                onChange={e => setFontColor(e.target.value)}
                className="p-1 h-10 w-10 bg-neutral-700 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none"
                id="hs-color-input"
                title="Choose your color"
              />
            </div>
          </div>
        </div>

        <div className="w-[1px] h-5 bg-neutral-200 mx-2" />

        <div className="flex overflow-x-auto  gap-2 sm:gap-5">
          {tools.map(tool => {
            return (
              <Tooltip
                key={tool.name}
                content={tool.name}
                showArrow
                placement="bottom"
                color="foreground"
                style={{
                  fontFamily: "monospace",
                }}
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
                  {tool?.icon ? (
                    <tool.icon />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {tool?.el}
                    </div>
                  )}
                </div>
              </Tooltip>
            );
          })}
        </div>

        <div className="w-[1px] h-5 bg-neutral-200 mx-2" />

        <Tooltip
          content="me (ctrl+p)"
          showArrow
          placement="bottom"
          color="foreground"
          style={{
            fontFamily: "monospace",
          }}
        >
          <div
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={`cursor-pointer hover:bg-neutral-600 rounded-lg transition ${
              isProfileOpen && "bg-neutral-600"
            } ${user ? "p-1" : "p-2"}`}
          >
            {user ? <Avatar size="sm" /> : <IconUser />}
          </div>
        </Tooltip>

        <div
          className={`absolute bg-[#212020] top-16 right-4 max-w-72 min-w-72 rounded-lg overflow-hidden duration-300 ${
            isProfileOpen ? "skew-x-0 scale-1" : "skew-x-[75deg] scale-[0.0]"
          }`}
        >
          <div className="">
            <div className="capitalize divide-y-1 divide-neutral-600">
              {user && (
                <div className="p-2 px-4 w-full hover:bg-neutral-700 cursor-pointer transition pointer-events-none">
                  <div className="flex gap-2">
                    <div className=" ">
                      <Avatar
                        src={user?.photoURL}
                        alt="user photo"
                        className=""
                      />
                    </div>
                    <div>
                      <h1 className="text-lg tracking-tighter">{user?.name}</h1>
                      <p className="text-sm tracking-widest">
                        @{user?.username}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <h4 className="p-2 px-4 w-full hover:bg-neutral-700 cursor-pointer transition ">
                saved drawings
              </h4>
              <h4 className="p-2 px-4 w-full hover:bg-neutral-700 cursor-pointer transition ">
                third option
              </h4>
              <h4 className="p-2 px-4 w-full hover:bg-neutral-700 cursor-pointer transition ">
                fourth option
              </h4>
              <h4 className="p-2 px-4 w-full hover:bg-neutral-700 cursor-pointer transition ">
                fifth option
              </h4>
              {user ? (
                <Button
                  onClick={logOut}
                  className="relative w-full flex justify-center border border-transparent text-sm font-medium rounded-none text-white bg-purple-500 hover:bg-purple-600 focus:outline-none   active:scale-100 duration-300 disabled:opacity-60 uppercase focus:ring-0"
                >
                  Log out
                </Button>
              ) : (
                <Button
                  onClick={() => setIsAuthOpen(!isAuthOpen)}
                  className="relative w-full flex justify-center border border-transparent text-sm font-medium rounded-none text-white bg-purple-500 hover:bg-purple-600 focus:outline-none   active:scale-100 duration-300 disabled:opacity-60 uppercase focus:ring-0"
                >
                  sign in
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      <Stage
        ref={stageRef}
        width={window.innerWidth - 4}
        height={window.innerHeight * 5}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        onClick={handleStgClick}
      >
        <Layer ref={canvasRef}>
          {lines.map((line, index) => {
            return (
              <Line
                key={index}
                name="line"
                points={line.points()}
                stroke={line.stroke()}
                strokeWidth={line.strokeWidth()}
                lineCap="round"
                lineJoin="round"
                dash={line.dash()}
                tension={line.tension()}
                fill={line.fill()}
                closed={line.closed()}
                draggable={false}
                globalCompositeOperation={line.globalCompositeOperation()}
                onContextMenu={e => {
                  setIsMenuOpen(true);

                  const rightSpace = window.innerWidth - e?.evt.clientX;
                  const isLeftSpaceAvailable =
                    window.innerWidth - rightSpace >= 288;
                  const isRightSpaceAvailable =
                    window.innerWidth - e?.evt.clientX >= 288;

                  if (isRightSpaceAvailable) {
                    setMenuPosition({
                      x: e?.evt.clientX,
                      y: e?.evt.clientY,
                    });
                  } else if (isLeftSpaceAvailable) {
                    setMenuPosition({
                      x: e?.evt.clientX - 288,
                      y: e?.evt.clientY,
                    });
                  } else if (
                    !isRightSpaceAvailable &&
                    !isLeftSpaceAvailable &&
                    window.innerWidth < 580
                  ) {
                    setMenuPosition({
                      x: window.innerWidth / 2 - 144,
                      y: e?.evt.clientY,
                    });
                  } else {
                    setMenuPosition({
                      x: e?.evt.clientX - 288,
                      y: e?.evt.clientY,
                    });
                  }
                }}
              />
            );
          })}

          {rectangles.map((rect, index) => {
            return (
              <Rect
                key={index}
                name="rect"
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
                onContextMenu={e => {
                  setIsMenuOpen(true);

                  const rightSpace = window.innerWidth - e?.evt.clientX;
                  const isLeftSpaceAvailable =
                    window.innerWidth - rightSpace >= 288;
                  const isRightSpaceAvailable =
                    window.innerWidth - e?.evt.clientX >= 288;

                  if (isRightSpaceAvailable) {
                    setMenuPosition({
                      x: e?.evt.clientX,
                      y: e?.evt.clientY,
                    });
                  } else if (isLeftSpaceAvailable) {
                    setMenuPosition({
                      x: e?.evt.clientX - 288,
                      y: e?.evt.clientY,
                    });
                  } else if (
                    !isRightSpaceAvailable &&
                    !isLeftSpaceAvailable &&
                    window.innerWidth < 580
                  ) {
                    setMenuPosition({
                      x: window.innerWidth / 2 - 144,
                      y: e?.evt.clientY,
                    });
                  } else {
                    setMenuPosition({
                      x: e?.evt.clientX - 288,
                      y: e?.evt.clientY,
                    });
                  }
                }}
              />
            );
          })}

          {/* {circles.map((circle, index) => {
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
          })} */}

          {ellipses.map((ellipse, index) => {
            return (
              <Ellipse
                key={index}
                name="circle"
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
                onContextMenu={e => {
                  setIsMenuOpen(true);

                  const rightSpace = window.innerWidth - e?.evt.clientX;
                  const isLeftSpaceAvailable =
                    window.innerWidth - rightSpace >= 288;
                  const isRightSpaceAvailable =
                    window.innerWidth - e?.evt.clientX >= 288;

                  if (isRightSpaceAvailable) {
                    setMenuPosition({
                      x: e?.evt.clientX,
                      y: e?.evt.clientY,
                    });
                  } else if (isLeftSpaceAvailable) {
                    setMenuPosition({
                      x: e?.evt.clientX - 288,
                      y: e?.evt.clientY,
                    });
                  } else if (
                    !isRightSpaceAvailable &&
                    !isLeftSpaceAvailable &&
                    window.innerWidth < 580
                  ) {
                    setMenuPosition({
                      x: window.innerWidth / 2 - 144,
                      y: e?.evt.clientY,
                    });
                  } else {
                    setMenuPosition({
                      x: e?.evt.clientX - 288,
                      y: e?.evt.clientY,
                    });
                  }
                }}
              />
            );
          })}

          {arrows.map((arrow, index) => {
            return (
              <Arrow
                key={index}
                name="arrow"
                points={arrow.points()}
                pointerLength={arrow.pointerLength()}
                pointerWidth={arrow.pointerWidth()}
                fill={arrow.fill()}
                stroke={arrow.stroke()}
                strokeWidth={arrow.strokeWidth()}
                draggable={false}
                onContextMenu={e => {
                  setIsMenuOpen(true);

                  const rightSpace = window.innerWidth - e?.evt.clientX;
                  const isLeftSpaceAvailable =
                    window.innerWidth - rightSpace >= 288;
                  const isRightSpaceAvailable =
                    window.innerWidth - e?.evt.clientX >= 288;

                  if (isRightSpaceAvailable) {
                    setMenuPosition({
                      x: e?.evt.clientX,
                      y: e?.evt.clientY,
                    });
                  } else if (isLeftSpaceAvailable) {
                    setMenuPosition({
                      x: e?.evt.clientX - 288,
                      y: e?.evt.clientY,
                    });
                  } else if (
                    !isRightSpaceAvailable &&
                    !isLeftSpaceAvailable &&
                    window.innerWidth < 580
                  ) {
                    setMenuPosition({
                      x: window.innerWidth / 2 - 144,
                      y: e?.evt.clientY,
                    });
                  } else {
                    setMenuPosition({
                      x: e?.evt.clientX - 288,
                      y: e?.evt.clientY,
                    });
                  }
                }}
              />
            );
          })}

          {straightLines.map((line, index) => {
            return (
              <Line
                key={index}
                name="line"
                points={line.points()}
                stroke={line.stroke()}
                strokeWidth={line.strokeWidth()}
                lineCap="round"
                lineJoin="round"
                draggable={false}
                onContextMenu={e => {
                  setIsMenuOpen(true);

                  const rightSpace = window.innerWidth - e?.evt.clientX;
                  const isLeftSpaceAvailable =
                    window.innerWidth - rightSpace >= 288;
                  const isRightSpaceAvailable =
                    window.innerWidth - e?.evt.clientX >= 288;

                  if (isRightSpaceAvailable) {
                    setMenuPosition({
                      x: e?.evt.clientX,
                      y: e?.evt.clientY,
                    });
                  } else if (isLeftSpaceAvailable) {
                    setMenuPosition({
                      x: e?.evt.clientX - 288,
                      y: e?.evt.clientY,
                    });
                  } else if (
                    !isRightSpaceAvailable &&
                    !isLeftSpaceAvailable &&
                    window.innerWidth < 580
                  ) {
                    setMenuPosition({
                      x: window.innerWidth / 2 - 144,
                      y: e?.evt.clientY,
                    });
                  } else {
                    setMenuPosition({
                      x: e?.evt.clientX - 288,
                      y: e?.evt.clientY,
                    });
                  }
                }}
              />
            );
          })}

          {texts.map((text, index) => (
            <EditableText
              key={index}
              name="text"
              text={text}
              index={index}
              drawingMode={drawingMode}
              onUpdateText={handleUpdateText}
              moveStart={handleMoveTextStart}
              moveHandler={handleMoveText}
              moveEnd={handleMoveTextEnd}
              fontSize={fontSize}
              setIsMenuOpen={setIsMenuOpen}
              setMenuPosition={setMenuPosition}
            />
          ))}

          <Rect
            ref={selectionRectRef}
            visible={selectionRect.visible}
            x={Math.min(selectionRect.x1, selectionRect.x2)}
            y={Math.min(selectionRect.y1, selectionRect.y2)}
            width={Math.abs(selectionRect.x2 - selectionRect.x1)}
            height={Math.abs(selectionRect.y2 - selectionRect.y1)}
            fill="rgba(56, 56, 56, 0.1)"
            stroke="#A3A9DC"
          />
          <Transformer
            ref={transformerRef}
            anchorStyleFunc={anchor => {
              anchor.cornerRadius(10);
              if (
                anchor.hasName("top-center") ||
                anchor.hasName("bottom-center")
              ) {
                anchor.height(6);
                anchor.offsetY(3);
                anchor.width(30);
                anchor.offsetX(15);
              }
              if (
                anchor.hasName("middle-left") ||
                anchor.hasName("middle-right")
              ) {
                anchor.height(30);
                anchor.offsetY(15);
                anchor.width(6);
                anchor.offsetX(3);
              }
            }}
            ignoreStroke={true}
            keepRatio={true}
            centeredScaling={true}
            rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
            rotationSnapTolerance={8}
            borderStroke="#A3A9DC"
            anchorStroke="#A3A9DC"
            anchorFill="#A3A9DC"
            anchorSize={15}
            flipEnabled={false}
          />
        </Layer>
      </Stage>
    </div>
  );
}

const EditableText = ({
  text,
  name = "text",
  index,
  onUpdateText,
  drawingMode,
  moveStart,
  moveHandler,
  moveEnd,
  fontSize = 16,
  setIsMenuOpen,
  setMenuPosition,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newText, setNewText] = useState(text.text);
  const inputRef = useRef(null);
  const textRef = useRef(null);

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
  };

  const handleBlur = () => {
    setIsEditing(false);
    onUpdateText(text, index, newText);
  };

  const handleChange = e => {
    setNewText(e.target.value);
  };
  console.log(text);
  return (
    <Group>
      <Text
        ref={textRef}
        name={name}
        x={text.x}
        y={text.y - 11}
        width={window.innerWidth - (text.x + fontSize)}
        text={isEditing ? newText : text.text}
        fontSize={text.fontSize}
        fontFamily="Kalam"
        fill={isEditing ? "transparent" : text.fill}
        draggable={drawingMode === "drag"}
        onDblClick={e => handleDblClick(e)}
        onDragStart={e => moveStart(text)}
        onDragMove={e => moveHandler(e, text, index)}
        onDragEnd={e => moveEnd(e, text)}
        lineHeight={1.5}
        wrap="word"
        onContextMenu={e => {
          setIsMenuOpen(true);

          const rightSpace = window.innerWidth - e?.evt.clientX;
          const isLeftSpaceAvailable = window.innerWidth - rightSpace >= 288;
          const isRightSpaceAvailable =
            window.innerWidth - e?.evt.clientX >= 288;

          if (isRightSpaceAvailable) {
            setMenuPosition({
              x: e?.evt.clientX,
              y: e?.evt.clientY,
            });
          } else if (isLeftSpaceAvailable) {
            setMenuPosition({
              x: e?.evt.clientX - 288,
              y: e?.evt.clientY,
            });
          } else if (
            !isRightSpaceAvailable &&
            !isLeftSpaceAvailable &&
            window.innerWidth < 580
          ) {
            setMenuPosition({
              x: window.innerWidth / 2 - 144,
              y: e?.evt.clientY,
            });
          } else {
            setMenuPosition({
              x: e?.evt.clientX - 288,
              y: e?.evt.clientY,
            });
          }
        }}
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
            onInput={e => {
              e.target.style.height = e.target.scrollHeight + "px";
            }}
            onFocus={e => {
              e.target.style.height = e.target.scrollHeight + "px";
            }}
            onMouseEnter={() => {
              if (inputRef.current) {
                inputRef.current.select();
              }
            }}
            style={{
              width: window.innerWidth - (text.x + fontSize),
              position: "absolute",
              top: text.y - 16,
              left: text.x - 3,
              fontSize: text.fontSize,
              fontFamily: "Kalam",
              color: "white",
              padding: 2,
              zIndex: 3000,
              background: "transparent",
            }}
            className="resize-none border-none outline-none focus:outline-none"
          />
        )}
      </Html>
    </Group>
  );
};

export default Whiteboard;
