import * as net from "net";

export type PingStatus = "CONNECTED" | "TIMEOUT" | "ERROR";

export function tcpPing(
  host: string,
  port: number,
  timeout = 4000,
): Promise<{ status: PingStatus; latency: number | null }> {
  return new Promise((resolve) => {
    const start = Date.now();
    const socket = new net.Socket();
    socket.setTimeout(timeout);

    socket.connect(port, host, () => {
      const latency = Date.now() - start;
      socket.destroy();
      resolve({ status: "CONNECTED", latency });
    });

    socket.on("timeout", () => {
      socket.destroy();
      resolve({ status: "TIMEOUT", latency: null });
    });

    socket.on("error", () => {
      socket.destroy();
      resolve({ status: "ERROR", latency: null });
    });
  });
}
