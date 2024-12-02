import { scaleLinear } from "d3";

export const scale = (
  minDomain: number,
  maxDomain: number,
  minRange: number,
  maxRange: number
) => {
  return scaleLinear()
    .domain([minDomain, maxDomain])
    .range([minRange, maxRange]);
};
