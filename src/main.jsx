import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Whiteboard from "./components/specific/Whiteboard";
import { NextUIProvider } from "@nextui-org/react";
import AuthForm from "./components/auth/AuthForm";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/specific/Navbar";
import WhiteboardProvider from "./providers/WhiteboardProvider";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <div>
        <Toaster />
        {/* <h1 className=" ">Hello world!</h1> */}
        {/* <Navbar /> */}
        <Whiteboard />
      </div>
    ),
  },
  {
    path: "/auth",
    element: <AuthForm />,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <NextUIProvider>
      <WhiteboardProvider>
        <div onContextMenu={e => e.preventDefault()}>
          <RouterProvider router={router} />
        </div>
      </WhiteboardProvider>
    </NextUIProvider>
  </StrictMode>
);
