import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useState,
} from "react";
import { MAX_X_POINT, MAX_Y_POINT } from "../constants";

export type Datum = {
  x: number;
  y: number;
};
type PlotData = {
  data: Datum[];
};

const DataContext = createContext<PlotData | null>(null);

export const DataProvider: FC<PropsWithChildren> = ({ children }) => {
  const [data] = useState<Datum[]>(() =>
    Array.from({ length: MAX_X_POINT }).map((_, i) => ({
      x: i,
      y: Math.round(Math.random() * (MAX_Y_POINT - 30) + 30),
    }))
  );
  const context = {
    data,
  };
  return (
    <DataContext.Provider value={context}>{children}</DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext<PlotData | null>(DataContext);
  if (context === null) {
    throw new Error("useData must be inside <DataContext />");
  }

  return context;
};
