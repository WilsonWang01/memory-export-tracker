import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { env, paths } from "./config.js";
import { refreshTradeData } from "./jobs/refreshTradeData.js";
import { readStore } from "./storage.js";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

function json(response, statusCode, body) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

async function serveStatic(request, response) {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const safePath = path.normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(paths.publicDir, safePath === "/" ? "index.html" : safePath);
  if (!filePath.startsWith(paths.publicDir)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const content = await fs.readFile(filePath);
    response.writeHead(200, { "Content-Type": mimeTypes[path.extname(filePath)] ?? "application/octet-stream" });
    response.end(content);
  } catch {
    const index = await fs.readFile(path.join(paths.publicDir, "index.html"));
    response.writeHead(200, { "Content-Type": mimeTypes[".html"] });
    response.end(index);
  }
}

async function handleRequest(request, response) {
  try {
    if (request.method === "GET" && request.url === "/api/health") {
      json(response, 200, { ok: true, now: new Date().toISOString() });
      return;
    }

    if (request.method === "GET" && new URL(request.url, `http://${request.headers.host}`).pathname === "/api/dashboard") {
      json(response, 200, await readStore());
      return;
    }

    if (request.method === "POST" && new URL(request.url, `http://${request.headers.host}`).pathname === "/api/refresh") {
      json(response, 200, await refreshTradeData());
      return;
    }

    if (request.method === "GET") {
      await serveStatic(request, response);
      return;
    }

    json(response, 405, { error: "Method not allowed" });
  } catch (error) {
    json(response, 500, { error: error instanceof Error ? error.message : "Unknown server error" });
  }
}

function nextScheduledRun(now = new Date()) {
  const parts = zonedParts(now, env.updateTimezone);
  for (let monthOffset = 0; monthOffset <= 2; monthOffset += 1) {
    const monthStart = new Date(Date.UTC(parts.year, parts.month - 1 + monthOffset, 1));
    const year = monthStart.getUTCFullYear();
    const month = monthStart.getUTCMonth() + 1;
    const candidates = env.updateDays
      .map((day) => zonedTimeToUtc(year, month, day, env.updateHour, env.updateMinute, env.updateTimezone))
      .filter((date) => date > now)
      .sort((a, b) => a.getTime() - b.getTime());
    if (candidates.length > 0) return candidates[0];
  }

  return zonedTimeToUtc(parts.year, parts.month + 1, 1, env.updateHour, env.updateMinute, env.updateTimezone);
}

function zonedParts(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).formatToParts(date);
  return Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, Number(part.value)]));
}

function timeZoneOffsetMs(date, timeZone) {
  const parts = zonedParts(date, timeZone);
  const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  return asUtc - date.getTime();
}

function zonedTimeToUtc(year, month, day, hour, minute, timeZone) {
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const offset = timeZoneOffsetMs(utcGuess, timeZone);
  return new Date(utcGuess.getTime() - offset);
}

function scheduleDataWindowRefresh() {
  const next = nextScheduledRun();
  const waitMs = next.getTime() - Date.now();
  console.log(
    `Next refresh: ${next.toISOString()} (${env.updateTimezone} target days ${env.updateDays.join("/")}, ${env.updateHour}:${String(env.updateMinute).padStart(2, "0")})`
  );
  setTimeout(async () => {
    console.log(`[scheduler] refresh started at ${new Date().toISOString()}`);
    const store = await refreshTradeData();
    console.log(`[scheduler] refresh finished in ${store.meta.mode} mode`);
    scheduleDataWindowRefresh();
  }, waitMs);
}

const server = http.createServer(handleRequest);

server.listen(env.port, async () => {
  await refreshTradeData();
  console.log(`Dashboard listening on http://localhost:${env.port}`);
  scheduleDataWindowRefresh();
});
