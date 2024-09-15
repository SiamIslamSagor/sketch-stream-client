import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Whiteboard from "./components/specific/Whiteboard";
import { NextUIProvider } from "@nextui-org/react";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <div>
        {/* <h1 className=" ">Hello world!</h1> */}
        <Whiteboard />
      </div>
    ),
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <NextUIProvider>
      <RouterProvider router={router} />
    </NextUIProvider>
  </StrictMode>
);
