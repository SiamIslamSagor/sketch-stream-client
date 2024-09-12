import { Rect } from "react-konva";

const CustomRect = props => {
  console.log(props);
  return <Rect {...props} />;
};

export default CustomRect;
