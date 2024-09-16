import { WhiteboardContext } from "@/providers/WhiteboardProvider";
import { useContext } from "react";

const useContextData = () => {
  const providedData = useContext(WhiteboardContext);

  return providedData;
};

export default useContextData;
