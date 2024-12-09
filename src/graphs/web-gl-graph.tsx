import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useData } from "../contexts/data-context";
import { HEIGHT, MAX_Y_POINT, SCALE_X_MAX, WIDTH } from "../constants";
import { usePlot } from "../contexts/plot-context";
import { useWebGL } from "../WebGL";
import * as obj from "../../data.json";

const ZOOM_SENSITIVITY = 0.001;

export const WebGLGraph: FC = () => {
  /**
   * - [] test dynamic source with real time data changing
   */

  //   const positions = useMemo(() => {
  //     const data2 = obj["data"];
  //     const a = new Float32Array(data2.length * 2);
  //     console.log("here", data2);
  //     data2.forEach((datum, i) => {
  //       a[i * 2] = datum.x;
  //       a[i * 2 + 1] = datum.y;
  //     });
  //     return a;
  //   }, []);

  const navigate = useNavigate();
  const { data } = useData();
  const { xScale, yScale, setDragging, isDragging } = usePlot();
  const [mouseMove, setMouseMove] = useState(0);
  const [cursorX, setCursorX] = useState(0);
  const [scale, setScale] = useState(1);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const positions = useMemo(
    () =>
      new Float32Array(
        data.reduce(
          (acc, datum) => acc.concat([datum.x, datum.y]),
          [] as number[]
        )
      ),
    [data]
  );
  //   const positions = useMemo(
  //     () =>
  //       new Float32Array(
  //         data.reduce(
  //           (acc, datum) => acc.concat([xScale(datum.x), yScale(datum.y)]),
  //           [] as number[]
  //         )
  //       ),
  //     [data, xScale, yScale]
  //   );

  const { attributes, render, pan, gl, zoom } = useWebGL(canvas);
  useEffect(() => {
    if (gl && attributes && attributes?.program && canvas) {
      const { program } = attributes;
      render(gl, program, positions, { x: SCALE_X_MAX, y: MAX_Y_POINT });
    }
  }, [canvas, attributes, render, gl, positions]);

  useEffect(() => {
    if (gl && attributes && attributes?.program && canvas && isDragging) {
      const { panUniformLocation } = attributes;
      pan(gl, panUniformLocation, mouseMove, positions.length);
    }
  }, [mouseMove, attributes, pan, gl, canvas, isDragging, positions.length]);

  useEffect(() => {
    const listener = () => setDragging(false);
    window.addEventListener("mouseup", () => {
      listener();
    });
    return window.removeEventListener("mouseup", listener);
  }, [setDragging]);

  const onWheel = useCallback(
    (e: React.WheelEvent<HTMLCanvasElement>) => {
      if (gl && canvas && attributes) {
        const { left } = canvas.getBoundingClientRect();
        const cursor = e.clientX - left;
        const drag = mouseMove;
        console.log("cursor", mouseMove, cursor);
        // calculate zoom factor
        // console.log(e);
        const zoomFactor = Math.exp(-e.deltaY * ZOOM_SENSITIVITY);
        const newScale = scale * zoomFactor;
        // const translateX = (1 - zoomFactor) * (cursor - cursorX);
        const { zoomUniformLocation, cursorUniformLocation } = attributes;
        // console.log(newScale, translateX);
        zoom(
          gl,
          zoomUniformLocation,
          cursorUniformLocation,
          newScale,
          cursor,
          positions.length
        );
        setScale(newScale);
        // setCursorX((prev) => prev + cursor);
      }
    },
    [zoom, canvas, scale, attributes, positions, gl, mouseMove]
  );

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div>
        <button onClick={() => navigate("/svg")} style={{ width: 50 }}>
          Svg
        </button>
        <input type="number" />
      </div>
      <div style={{ position: "relative" }}>
        <canvas
          ref={setCanvas}
          width={WIDTH}
          height={HEIGHT}
          onMouseDown={() => setDragging(true)}
          onWheel={(e) => {
            // console.log("e", e);
            // setScale((prev) => prev + e.deltaX);
            onWheel(e);
          }}
          onMouseMove={(e) => {
            setMouseMove((prev) => {
              if (isDragging) console.log("mousemove", prev + e.movementX);
              return isDragging ? prev + e.movementX : prev;
            });
            // setCursorX((prev) => {
            //   if (canvas) {
            //     const { left } = canvas.getBoundingClientRect();
            //     if (isDragging) {
            //       return prev + e.movementX;
            //     }
            //   }
            //   return prev;
            // });
          }}
          style={{
            width: WIDTH,
            height: HEIGHT,
            position: "absolute",
            border: "1px solid black",
          }}
        />
      </div>
      <div style={{ position: "absolute", bottom: 10 }}>
        WebGL resources{" "}
        <NavLink to="https://webglfundamentals.org/">here</NavLink>
        <br />
        GLSL useful functions{" "}
        <NavLink to="https://shaderific.com/glsl/common_functions.html">
          here
        </NavLink>
      </div>
    </div>
  );
};
