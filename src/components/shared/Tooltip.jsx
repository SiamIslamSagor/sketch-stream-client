/* eslint-disable react/prop-types */
import { TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

const Tooltip = ({ content = "tooltip content", children }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {/* <button>Hover</button> */}
          {children ? children : <button>Hover</button>}
        </TooltipTrigger>
        <TooltipContent>
          {/* <p>Add to library</p> */}
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default Tooltip;
