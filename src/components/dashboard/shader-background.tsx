"use client";

import { useEffect, useRef } from "react";

const VERTEX_SHADER = `
  attribute vec2 position;
  varying vec2 v_texCoord;
  void main() {
    v_texCoord = (position + 1.0) / 2.0;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;
  varying vec2 v_texCoord;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;

  void main() {
    vec2 uv = v_texCoord;
    vec2 mouse = u_mouse / u_resolution;
    vec2 p = uv * 2.0 - 1.0;
    p.x *= u_resolution.x / u_resolution.y;
   float t = u_time * 0.15;

    vec3 color1 = vec3(0.01, 0.03, 0.08);
    vec3 color2 = vec3(0.04, 0.08, 0.15);
    vec3 color3 = vec3(0.08, 0.15, 0.35);

    float m = 0.0;
    for (float i = 1.0; i < 4.0; i++) {
      p.x += sin(p.y * i + t) * 0.3;
      p.y += cos(p.x * i + t) * 0.3;
      m += sin(length(p) * i);
    }
    m = m * 0.5 + 0.5;
    vec3 finalColor = mix(color1, color2, m);
    finalColor = mix(finalColor, color3, pow(m, 4.0) * 0.4);

    float distToMouse = length(uv - mouse);
    finalColor += color3 * (1.0 - smoothstep(0.0, 0.5, distToMouse)) * 0.15;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

export function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext("webgl");
    if (!canvas || !gl) return;

    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragmentShader = compileShader(
      gl,
      gl.FRAGMENT_SHADER,
      FRAGMENT_SHADER,
    );
    const program = gl.createProgram();
    if (!vertexShader || !fragmentShader || !program) return;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const positionLocation = gl.getAttribLocation(program, "position");
    const timeLocation = gl.getUniformLocation(program, "u_time");
    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const mouseLocation = gl.getUniformLocation(program, "u_mouse");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    function handleMouseMove(event: MouseEvent) {
      mouse.x = event.clientX;
      mouse.y = window.innerHeight - event.clientY;
    }
    window.addEventListener("mousemove", handleMouseMove);

    function draw(time: number) {
      if (!canvas || !gl) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(timeLocation, time * 0.001);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform2f(mouseLocation, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let frameId = 0;
    if (prefersReducedMotion) {
      draw(0);
    } else {
      const loop = (time: number) => {
        draw(time);
        frameId = requestAnimationFrame(loop);
      };
      frameId = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("mousemove", handleMouseMove);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteBuffer(positionBuffer);
    };
  }, []);

  return (
    <canvas
      aria-hidden
      className="fixed inset-0 -z-10 h-screen w-screen opacity-80"
      ref={canvasRef}
    />
  );
}
