import express from "express";
import type { AppHealthResponse } from "@powerapp-yaml-studio/shared";

const app = express();
const port = Number(process.env.PORT ?? 3001);

app.get("/api/health", (_request, response) => {
  const payload: AppHealthResponse = { status: "ok" };
  response.json(payload);
});

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
