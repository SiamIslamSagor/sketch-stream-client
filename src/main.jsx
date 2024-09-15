import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Whiteboard from "./components/specific/Whiteboard";
import { NextUIProvider } from "@nextui-org/react";
import AuthForm from "./components/auth/AuthForm";
import { Toaster } from "react-hot-toast";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <div>
        <Toaster />
        {/* <h1 className=" ">Hello world!</h1> */}
        {/* <Whiteboard /> */}
        <AuthForm />
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
