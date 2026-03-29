import express from "express";
import type { AppHealthResponse } from "@powerapp/shared";

const app = express();
const port = Number(process.env.PORT ?? 3001);

app.get("/api/health", (_req, res) => {
  const response: AppHealthResponse = { status: "ok" };
  res.json(response);
});

app.listen(port, () => {
  console.log(`API server listening at http://localhost:${port}`);
});
