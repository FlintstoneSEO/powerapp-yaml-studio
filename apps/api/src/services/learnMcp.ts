import type { DocumentationReference, GenerateYamlRequest } from "@powerapp-yaml-studio/shared";

type JsonRpcSuccess<T> = {
  jsonrpc: "2.0";
  id: string | number;
  result: T;
};

type JsonRpcFailure = {
  jsonrpc: "2.0";
  id: string | number | null;
  error: {
    code: number;
    message: string;
  };
};

type JsonRpcResponse<T> = JsonRpcSuccess<T> | JsonRpcFailure;

type McpTool = {
  name: string;
  description?: string;
};

type McpToolListResult = {
  tools?: McpTool[];
};

type McpToolCallResult = {
  content?: Array<{
    type?: string;
    text?: string;
  }>;
  structuredContent?: unknown;
};

export type LearnGroundingResult = {
  references: DocumentationReference[];
  warning?: string;
};

function getLearnMcpEndpoint() {
  return process.env.LEARN_MCP_URL?.trim() ?? "";
}

function buildSearchTerms(request: GenerateYamlRequest): string[] {
  const terms = [request.screenGoal, `Power Apps ${request.version}`];

  if (request.theme.themeName.trim()) {
    terms.push(`${request.theme.themeName} theme`);
  }

  if (request.theme.cornerStyle.trim()) {
    terms.push(`${request.theme.cornerStyle} corner style`);
  }

  return terms;
}

function extractToolNames(tools: McpTool[]) {
  return tools.map((tool) => tool.name.toLowerCase());
}

function chooseSearchTool(tools: McpTool[]) {
  const normalizedNames = extractToolNames(tools);
  const preferredMatches = ["search", "learn", "doc", "microsoft"];

  const selectedIndex = normalizedNames.findIndex((name) =>
    preferredMatches.some((term) => name.includes(term)),
  );

  if (selectedIndex >= 0) {
    return tools[selectedIndex];
  }

  return tools[0];
}

function safeSummary(text: string) {
  return text.replace(/\s+/g, " ").trim().slice(0, 240);
}

function normalizeUnknownItem(value: unknown): DocumentationReference | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const item = value as Record<string, unknown>;
  const title =
    (typeof item.title === "string" && item.title) ||
    (typeof item.name === "string" && item.name) ||
    (typeof item.heading === "string" && item.heading) ||
    "Microsoft Learn reference";

  const source =
    (typeof item.source === "string" && item.source) ||
    (typeof item.url === "string" && item.url) ||
    (typeof item.link === "string" && item.link) ||
    "Microsoft Learn";

  const summary =
    (typeof item.summary === "string" && item.summary) ||
    (typeof item.snippet === "string" && item.snippet) ||
    (typeof item.description === "string" && item.description) ||
    "Helpful guidance from Microsoft Learn.";

  return {
    title: title.trim(),
    source: source.trim(),
    summary: safeSummary(summary),
  };
}

function normalizeToolCallResult(raw: McpToolCallResult): DocumentationReference[] {
  const structured = raw.structuredContent;
  const normalized: DocumentationReference[] = [];

  if (Array.isArray(structured)) {
    for (const item of structured) {
      const normalizedItem = normalizeUnknownItem(item);
      if (normalizedItem) {
        normalized.push(normalizedItem);
      }
    }
  }

  if (normalized.length > 0) {
    return normalized.slice(0, 5);
  }

  const textContent = raw.content
    ?.filter((entry) => entry.type === "text" && typeof entry.text === "string")
    .map((entry) => entry.text?.trim())
    .filter((entry): entry is string => Boolean(entry))
    .join("\n")
    .trim();

  if (!textContent) {
    return [];
  }

  return [
    {
      title: "Microsoft Learn search result",
      source: "Microsoft Learn MCP",
      summary: safeSummary(textContent),
    },
  ];
}

async function postJsonRpc<T>(endpoint: string, method: string, params?: unknown): Promise<T> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: method,
      method,
      params,
    }),
  });

  if (!response.ok) {
    throw new Error(`Learn MCP request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as JsonRpcResponse<T>;

  if ("error" in payload) {
    throw new Error(payload.error.message);
  }

  return payload.result;
}

export async function getLearnGrounding(request: GenerateYamlRequest): Promise<LearnGroundingResult> {
  const endpoint = getLearnMcpEndpoint();

  if (!endpoint) {
    return {
      references: [],
      warning: "Microsoft Learn grounding is disabled because LEARN_MCP_URL is not configured.",
    };
  }

  try {
    const toolListResult = await postJsonRpc<McpToolListResult>(endpoint, "tools/list");
    const tools = toolListResult.tools ?? [];

    if (tools.length === 0) {
      return {
        references: [],
        warning: "Microsoft Learn grounding returned no tools.",
      };
    }

    const selectedTool = chooseSearchTool(tools);
    const searchTerms = buildSearchTerms(request).join(" | ");

    const toolCallResult = await postJsonRpc<McpToolCallResult>(endpoint, "tools/call", {
      name: selectedTool.name,
      arguments: {
        query: searchTerms,
        limit: 5,
      },
    });

    return {
      references: normalizeToolCallResult(toolCallResult),
    };
  } catch (error) {
    return {
      references: [],
      warning:
        error instanceof Error
          ? `Microsoft Learn grounding unavailable: ${error.message}`
          : "Microsoft Learn grounding unavailable.",
    };
  }
}
