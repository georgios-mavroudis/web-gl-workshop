import { BrowserRouter, Route, Routes } from "react-router-dom";
import { DataProvider } from "./contexts/data-context";
import { PlotProvider } from "./contexts/plot-context";
import { SvgGraph } from "./graphs/svg-graph";

function App() {
  return (
    <BrowserRouter>
      <DataProvider>
        <PlotProvider>
          <Routes>
            <Route path={"/"} index element={<SvgGraph />} />
            {/* <Route path={RoutePaths.Analysis} element={<Analysis />} /> */}
          </Routes>
        </PlotProvider>
      </DataProvider>
    </BrowserRouter>
  );
}

export default App;
