import { ScaleLinear, zoomIdentity, ZoomTransform } from "d3";
import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from "react";
import { scale } from "../utils";
import { HEIGHT, MAX_Y_POINT, SCALE_X_MAX, WIDTH } from "../constants";

export type PlotData = {
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  transform: ZoomTransform;
  isDragging: boolean;
  setXScale: (xScale: ScaleLinear<number, number>) => void;
  setYScale: (yScale: ScaleLinear<number, number>) => void;
  setTransform: (transform: ZoomTransform) => void;
  setDragging: (dragging: boolean) => void;
};

type PlotAction =
  | {
      type: "set-x-scale";
      xScale: ScaleLinear<number, number>;
    }
  | {
      type: "set-y-scale";
      yScale: ScaleLinear<number, number>;
    }
  | {
      type: "set-transform";
      transform: ZoomTransform;
    }
  | {
      type: "set-dragging";
      dragging: boolean;
    };

const PlotContext = createContext<PlotData | null>(null);

const initialState = (): PlotData => ({
  xScale: scale(0, SCALE_X_MAX, 0, WIDTH),
  yScale: scale(0, MAX_Y_POINT, 0, HEIGHT),
  transform: zoomIdentity,
  setXScale: () => {},
  setYScale: () => {},
  setTransform: () => {},
  setDragging: () => {},
  isDragging: false,
});

const plotReducer = (state: PlotData, action: PlotAction): PlotData => {
  switch (action.type) {
    case "set-transform":
      return { ...state, transform: action.transform };
    case "set-x-scale":
      return { ...state, xScale: action.xScale };
    case "set-y-scale":
      return { ...state, yScale: action.yScale };
    case "set-dragging":
      return { ...state, isDragging: action.dragging };
  }
};

export const PlotProvider: FC<PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(plotReducer, initialState());

  const setXScale = useCallback(
    (xScale: ScaleLinear<number, number>) => {
      dispatch({ type: "set-x-scale", xScale });
    },
    [dispatch]
  );

  const setYScale = useCallback(
    (yScale: ScaleLinear<number, number>) => {
      dispatch({ type: "set-y-scale", yScale });
    },
    [dispatch]
  );

  const setTransform = useCallback(
    (transform: ZoomTransform) => {
      dispatch({ type: "set-transform", transform });
    },
    [dispatch]
  );

  const setDragging = useCallback(
    (dragging: boolean) => {
      dispatch({ type: "set-dragging", dragging });
    },
    [dispatch]
  );

  const context: PlotData = useMemo(
    () => ({
      xScale: state.xScale,
      yScale: state.yScale,
      transform: state.transform,
      isDragging: state.isDragging,
      setXScale,
      setYScale,
      setTransform,
      setDragging,
    }),
    [state, setTransform, setXScale, setYScale, setDragging]
  );
  return (
    <PlotContext.Provider value={context}>{children}</PlotContext.Provider>
  );
};

export const usePlot = () => {
  const context = useContext<PlotData | null>(PlotContext);
  if (context === null) {
    throw new Error("usePlot must be inside <PlotContext />");
  }

  return context;
};
