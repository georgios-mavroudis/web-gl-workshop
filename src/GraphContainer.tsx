import { FC, PropsWithChildren } from "react";
import { CONTAINER_ID, HEIGHT, WIDTH } from "./constants";

export const GraphContainer: FC<PropsWithChildren> = ({ children }) => {
  return (
    <svg
      id="graph"
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
    >
      <rect
        width={WIDTH + "px"}
        height={HEIGHT + "px"}
        stroke="black"
        fill="white"
        strokeWidth={2}
        display="absolute"
      />
      {children}
      <rect
        id={CONTAINER_ID}
        width={WIDTH + "px"}
        height={HEIGHT + "px"}
        fill="transparent"
      />
    </svg>
  );
};
