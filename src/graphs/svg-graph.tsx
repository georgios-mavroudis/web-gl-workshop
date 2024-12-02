import { FC, useEffect, useMemo } from "react";
import { useData } from "../contexts/data-context";
import { scale } from "../utils";
import {
  CONTAINER_ID,
  HEIGHT,
  MAX_Y_POINT,
  SCALE_X_MAX,
  WIDTH,
} from "../constants";
import { BaseType, select, Selection, zoom } from "d3";
import { usePlot } from "../contexts/plot-context";
import { GraphContainer } from "../GraphContainer";

export const SvgGraph: FC = () => {
  const { data } = useData();
  console.log("data", data);
  const { transform } = usePlot();
  const { setTransform } = usePlot();
  const xScale = useMemo(
    () => transform.rescaleX(scale(0, SCALE_X_MAX, 0, WIDTH)),
    [transform]
  );
  const yScale = useMemo(() => scale(0, MAX_Y_POINT, 0, HEIGHT), []);
  useEffect(() => {
    select(`#${CONTAINER_ID}`).call(
      zoom()
        // .scaleExtent([0, 30])
        .on("zoom", (e) => {
          console.log("transform", e.transform);
          setTransform(e.transform);
        }) as (
        selection: Selection<BaseType, unknown, HTMLElement, any>
      ) => void
    );
  }, [setTransform]);

  return (
    <GraphContainer>
      {data.map(({ x, y }, i) => {
        if (i === 0) {
          return (
            <circle
              key={i}
              cx={xScale(x)}
              cy={yScale(0)}
              r={2}
              fill={"black"}
            />
          );
        }
        return (
          <circle
            key={i}
            cx={xScale(x)}
            cy={yScale(y)}
            r={4}
            strokeWidth={3}
            stroke={"black"}
            fill={"red"}
          />
        );
      })}
    </GraphContainer>
  );
};
