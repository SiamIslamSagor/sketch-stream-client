import useAxiosPublic from "@/hooks/useAxiosPublic";
import { createContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

export const WhiteboardContext = createContext(null);

const WhiteboardProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [stroke, setStroke] = useState(5);
  const [color, setColor] = useState("#32a852");

  const [fillColor, setFillColor] = useState("#32a852");
  const [isFill, setIsFill] = useState(false);

  const [fontSize, setFontSize] = useState(32);
  const [fontColor, setFontColor] = useState("#ffffff");

  const axiosPublic = useAxiosPublic();

  const logOut = async () => {
    const toastId = toast.loading("processing...");

    try {
      const res = await axiosPublic.get("/user/logout");
      console.log(res.data);
      if (res?.data.success) {
        toast.success("Logout successfully.", {
          id: toastId,
        });
        setUser(null);
      }
    } catch (error) {
      console.log("Logout failed:", error);
      toast.error("Logout failed! try again", { id: toastId });
    }
  };

  const data = {
    stroke,
    setStroke,
    color,
    setColor,
    fillColor,
    setFillColor,
    isFill,
    setIsFill,
    fontColor,
    setFontColor,
    fontSize,
    setFontSize,
    user,
    setUser,
    logOut,
  };

  useEffect(() => {
    axiosPublic
      .get("/user/me")
      .then(res => {
        setUser(res.data.user);
      })
      .catch(err => {
        console.log(err);
        setUser(null);
      });
  }, [axiosPublic]);

  return (
    <WhiteboardContext.Provider value={data}>
      {children}
    </WhiteboardContext.Provider>
  );
};

export default WhiteboardProvider;
