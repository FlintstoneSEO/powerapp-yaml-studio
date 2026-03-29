import express from "express";
import {
  generateYaml,
  type AppHealthResponse,
  type GenerateYamlRequest,
} from "@powerapp-yaml-studio/shared";

const app = express();
const port = Number(process.env.PORT ?? 3001);

app.use(express.json());

app.get("/api/health", (_request, response) => {
  const payload: AppHealthResponse = { status: "ok" };
  response.json(payload);
});

app.post("/api/generate", async (request, response) => {
  const { screenGoal, version, theme } = request.body as Partial<GenerateYamlRequest>;

  console.log("POST /api/generate", {
    screenGoal,
    version,
    theme,
  });

  if (
    typeof screenGoal !== "string" ||
    typeof version !== "string" ||
    typeof theme?.themeName !== "string" ||
    typeof theme?.primaryColor !== "string" ||
    typeof theme?.fontFamily !== "string" ||
    typeof theme?.cornerStyle !== "string"
  ) {
    response.status(400).json({
      error: "Invalid request body. Expected screenGoal, version, and a complete theme object.",
    });
    return;
  }

  await new Promise((resolve) => {
    setTimeout(resolve, 500);
  });

  response.json(
    generateYaml({
      screenGoal,
      version,
      theme,
    }),
  );
});

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
