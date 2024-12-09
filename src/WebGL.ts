import { useMemo } from "react";

const NORMALIZE = false; // dont normalize the data
const SIZE = 2; // 2 components per iteration
const STRIDE = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
const OFFSET = 0; // start at the beginning of the buffer

export const useWebGL = (canvas: HTMLCanvasElement | null) => {
  const gl = canvas?.getContext("webgl");
  const attributes = useMemo(() => (gl ? initiate(gl) : null), [gl]);
  return { gl, attributes, render, pan, zoom };
};

const initiate = (gl: WebGLRenderingContext) => {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  );
  if (!vertexShader || !fragmentShader) {
    return;
  }

  const program = createProgram(gl, vertexShader, fragmentShader);
  if (!program) {
    return;
  }

  const panUniformLocation = gl.getUniformLocation(program, "u_pan");
  const cursorUniformLocation = gl.getUniformLocation(program, "u_cursor");
  const zoomUniformLocation = gl.getUniformLocation(program, "u_zoom");
  gl.uniform2f(zoomUniformLocation, 1, 1);
  gl.uniform2f(cursorUniformLocation, 0, 0);
  gl.uniform2f(panUniformLocation, 0, 0);

  const positionBuffer = gl.createBuffer();
  if (!positionBuffer) {
    return;
  }
  // Bind the buffer position
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  return {
    program,
    panUniformLocation,
    zoomUniformLocation,
    cursorUniformLocation,
  };
};

const render = (
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  positions: Float32Array,
  domain: { x: number; y: number }
  // startingPoint: number
) => {
  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW); // TODO: try the DYNAMIC_DRAW

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // clear the canvas
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Tell it to use our program
  gl.useProgram(program);
  // set the resolution;

  gl.enableVertexAttribArray(positionAttributeLocation);

  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  // const size = 2; // 2 components per iteration
  const type = gl.FLOAT; // the data is 32 bit floats
  // const normalize = false; // dont normalize the data
  // const stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
  // const offset = 0; // start at the beginning of the buffer

  gl.vertexAttribPointer(
    positionAttributeLocation,
    SIZE,
    type,
    NORMALIZE,
    STRIDE,
    OFFSET
  );

  const resolutionUniformLocation = gl.getUniformLocation(
    program,
    "u_resolution"
  );
  const domainUniformLocation = gl.getUniformLocation(program, "u_domain");
  const zoomUniformLocation = gl.getUniformLocation(program, "u_zoom");
  gl.uniform2f(zoomUniformLocation, 1, 1);
  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
  gl.uniform2f(domainUniformLocation, domain.x, domain.y);
  // gl.uniform1f(uStartingPointUniformLocation, startingPoint);

  const primitiveType = gl.POINTS;
  const count = positions.length / 2;
  gl.drawArrays(primitiveType, OFFSET, count);
};

const zoom = (
  gl: WebGLRenderingContext,
  zoomUniformLocation: WebGLUniformLocation | null,
  cursorUniformLocation: WebGLUniformLocation | null,
  zoom = 1,
  cursor = 0,
  length: number
) => {
  gl.uniform2f(zoomUniformLocation, zoom, 1);
  gl.uniform2f(cursorUniformLocation, cursor, 0);
  const primitiveType = gl.POINTS;
  const count = length / 2;
  gl.drawArrays(primitiveType, OFFSET, count);
};

const pan = (
  gl: WebGLRenderingContext,
  panUniformLocation: WebGLUniformLocation | null,
  pan = 0,
  length: number
) => {
  gl.uniform2f(panUniformLocation, pan, 0);
  const primitiveType = gl.POINTS;
  const count = length / 2;
  gl.drawArrays(primitiveType, OFFSET, count);
};

const vertexShaderSource = `
  attribute vec2 a_position;
  uniform vec2 u_resolution;
  uniform vec2 u_domain;
  uniform vec2 u_pan;
  uniform vec2 u_zoom;
  uniform vec2 u_cursor;

  void main() {
    // convert the positions from pixels to the range [0.0, 1.0]
    vec2 scaledPos = a_position * u_resolution / u_domain;
    vec2 reversedYPos = vec2(scaledPos.x, u_resolution.y - scaledPos.y);
    vec2 zeroToOne = ((reversedYPos - u_cursor) * u_zoom + u_pan + u_cursor) / u_resolution;

    // convert from 0->1 to 0->2
    vec2 zeroToTwo = zeroToOne * 2.0;

    // convert from 0->2 to -1->1
    vec2 clipSpace = vec2(zeroToTwo - 1.0);
    gl_PointSize = 10.0;
    gl_Position = vec4(clipSpace, 0, 1);
  }
`;

const fragmentShaderSource = `
  precision mediump float;

  void main() {
    vec2 pointCoord = gl_PointCoord - vec2(0.5); // Normalized coordinates (0,0 to 1,1 -> centered at (0.5,0.5))
    float dist = length(pointCoord);

    // If the distance is greater than 0.5 (radius), discard the fragment
    if (dist > 0.5) {
      discard;
    } else if (dist > 0.24) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    } else {
      gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
  }
`;

const createShader = (
  gl: WebGLRenderingContext,
  type: number,
  source: string
) => {
  const shader = gl.createShader(type);

  if (!shader) {
    return;
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    return shader;
  }
  gl.deleteShader(shader);
};

const createProgram = (
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
) => {
  const program = gl.createProgram();
  if (!program) {
    return;
  }
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  } else {
    gl.deleteProgram(program);
  }
};