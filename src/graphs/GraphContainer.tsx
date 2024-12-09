import { FC, PropsWithChildren, useEffect } from "react";
import { CONTAINER_ID, HEIGHT, SCALE_X_MAX, WIDTH } from "../constants";
import { usePlot } from "../contexts/plot-context";
import { BaseType, select, Selection, zoom } from "d3";
import { scale } from "../utils";

export const GraphContainer: FC<PropsWithChildren> = ({ children }) => {
  const { setXScale, setTransform } = usePlot();
  useEffect(() => {
    select(`#${CONTAINER_ID}`).call(
      zoom().on("zoom", (e) => {
        setTransform(e.transform);
        setXScale(e.transform.rescaleX(scale(0, SCALE_X_MAX, 0, WIDTH)));
      }) as (selection: Selection<BaseType, unknown, HTMLElement, any>) => void
    );
  }, [setTransform, setXScale]);

  return (
    <div>
      <div style={{ position: "absolute", border: "1px solid black" }}>
        <svg
          id="graph"
          width={WIDTH}
          height={HEIGHT}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        >
          {children}
          <rect
            id={CONTAINER_ID}
            width={WIDTH + "px"}
            height={HEIGHT + "px"}
            fill="transparent"
          />
        </svg>
      </div>
    </div>
  );
};
