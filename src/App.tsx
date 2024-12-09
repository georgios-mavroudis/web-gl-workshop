import { BrowserRouter, Route, Routes } from "react-router-dom";
import { DataProvider } from "./contexts/data-context";
import { PlotProvider } from "./contexts/plot-context";
import { SvgGraph } from "./graphs/svg-graph";
import { WebGLGraph } from "./graphs/web-gl-graph";

function App() {
  return (
    <BrowserRouter>
      <DataProvider>
        <PlotProvider>
          <Routes>
            <Route path={"/svg"} index element={<SvgGraph />} />
            <Route path={"/"} element={<WebGLGraph />} />
          </Routes>
        </PlotProvider>
      </DataProvider>
    </BrowserRouter>
  );
}

export default App;
