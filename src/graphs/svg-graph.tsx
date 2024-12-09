import { FC } from "react";
import { useData } from "../contexts/data-context";
import { usePlot } from "../contexts/plot-context";
import { GraphContainer } from "./GraphContainer";
import { useNavigate } from "react-router-dom";

export const SvgGraph: FC = () => {
  const { data } = useData();
  const navigate = useNavigate();
  const { xScale, yScale } = usePlot();

  return (
    <>
      <h1>SVG</h1>
      <button onClick={() => navigate("/")}>Go to WebGL</button>
      <GraphContainer>
        {data.map(({ x, y }, i) => {
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
    </>
  );
};
