import { zoomIdentity, ZoomTransform } from "d3";
import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from "react";

export type PlotData = {
  //   xScale: ScaleTime<number, number>;
  //   yScale: ScaleLinear<number, number>;
  transform: ZoomTransform;
  //   setXScale: (xScale: ScaleTime<number, number>) => void;
  //   setYScale: (yScale: ScaleLinear<number, number>) => void;
  setTransform: (transform: ZoomTransform) => void;
};

type PlotAction =
  //   | {
  //       type: "set-x-scale";
  //       xScale: ScaleLinear<number, number>;
  //     }
  //   | {
  //       type: "set-y-scale";
  //       yScale: ScaleLinear<number, number>;
  //     }
  {
    type: "set-transform";
    transform: ZoomTransform;
  };

const PlotContext = createContext<PlotData | null>(null);

const initialState = (): PlotData => ({
  //   xScale: getInitialXScale(),
  //   yScale: getInitialYScale(SLEEP_SCORE),
  transform: zoomIdentity,
  //   setXScale: () => {},
  //   setYScale: () => {},
  setTransform: () => {},
});

const plotReducer = (state: PlotData, action: PlotAction): PlotData => {
  switch (action.type) {
    case "set-transform":
      return { ...state, transform: action.transform };
    // case "set-x-scale":
    //   return { ...state, xScale: action.xScale };
    // case "set-y-scale":
    //   return { ...state, yScale: action.yScale };
    // case "set-y-axis-display":
    //   return {
    //     ...state,
    //     yAxisDisplay: action.yAxisDisplay,
    //     yScale: getInitialYScale(action.yAxisDisplay),
    //   };
  }
};

export const PlotProvider: FC<PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(plotReducer, initialState());

  //   const setXScale = useCallback(
  //     (xScale: ScaleTime<number, number>) => {
  //       dispatch({ type: "set-x-scale", xScale });
  //     },
  //     [dispatch]
  //   );

  //   const setYScale = useCallback(
  //     (yScale: ScaleLinear<number, number>) => {
  //       dispatch({ type: "set-y-scale", yScale });
  //     },
  //     [dispatch]
  //   );

  const setTransform = useCallback(
    (transform: ZoomTransform) => {
      dispatch({ type: "set-transform", transform });
    },
    [dispatch]
  );

  const context: PlotData = useMemo(
    () => ({
      //   xScale: state.xScale,
      //   yScale: state.yScale,
      transform: state.transform,
      //   setXScale,
      //   setYScale,
      setTransform,
    }),
    [state, setTransform]
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
