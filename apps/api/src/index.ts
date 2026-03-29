import express from "express";
import type {
  ApiErrorResponse,
  AppHealthResponse,
  GenerateYamlRequest,
  GenerateYamlResponse,
} from "@powerapp-yaml-studio/shared";
import { generateYamlResponse } from "./generate.js";
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

app.post(
  "/api/generate",
  (request, response: express.Response<GenerateYamlResponse | ApiErrorResponse>) => {
    try {
      const payload = request.body as Partial<GenerateYamlRequest> | undefined;
      const screenGoal = payload?.screenGoal?.trim();
      const version = payload?.version?.trim();
      const theme = payload?.theme;

      if (!screenGoal || !version || !theme) {
        response.status(400).json({
          error: {
            message: "A screen goal, version, and theme profile are required to generate YAML.",
          },
        });
        return;
      }

      response.json(
        generateYamlResponse({
          screenGoal,
          version,
          theme: {
            themeName: theme.themeName ?? "",
            primaryColor: theme.primaryColor ?? "",
            fontFamily: theme.fontFamily ?? "",
            cornerStyle: theme.cornerStyle ?? "",
          },
        }),
      );
    } catch (error) {
      console.error("YAML generation failed", error);
      response.status(500).json({
        error: {
          message: "Unable to generate YAML right now. Please try again.",
        },
      });
    }
  },
);

app.use(
  (
    error: Error,
    _request: express.Request,
    response: express.Response<ApiErrorResponse>,
    _next: express.NextFunction,
  ) => {
    console.error("API request failed", error);
    const statusCode = error instanceof SyntaxError ? 400 : 500;
    const message =
      statusCode === 400
        ? "The API could not read the request body."
        : "The API could not process this request.";

    response.status(statusCode).json({
      error: {
        message,
      },
    });
  },
);
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
