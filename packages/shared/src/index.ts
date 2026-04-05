export type AppHealthResponse = {
  status: "ok";
};

export type ThemeProfile = {
  themeName: string;
  primaryColor: string;
  fontFamily: string;
  cornerStyle: string;
};

export type GenerateYamlRequest = {
  screenGoal: string;
  version: string;
  theme: ThemeProfile;
};

export type ValidationWarning = {
  code: string;
  message: string;
};

export type DocumentationReference = {
  title: string;
  source: string;
  summary: string;
};

export type GenerateYamlResponse = {
  yaml: string;
  compatibilityNotes: string[];
  validationWarnings: ValidationWarning[];
  documentationReferences: DocumentationReference[];
  groundingNote?: string;
};

export type ApiErrorResponse = {
  error: {
    message: string;
  };
};

type YamlScalar = string | number | boolean | null;
type YamlValue = YamlScalar | YamlObject | YamlValue[];

type YamlObject = {
  [key: string]: YamlValue;
};

function toPascalCase(value: string) {
  const words = value
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "GeneratedScreen";
  }

  return words.map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase()).join("");
}

function getScreenName(screenGoal: string) {
  const normalizedGoal = screenGoal.trim().toLowerCase();

  if (normalizedGoal.includes("home screen")) {
    return "HomeScreen";
  }

  return `${toPascalCase(screenGoal)}Screen`;
}

function formatYamlScalar(value: YamlScalar) {
  if (typeof value === "string") {
    return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  }

  if (value === null) {
    return "null";
  }

  return String(value);
}

function isYamlObject(value: YamlValue): value is YamlObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function renderYaml(value: YamlValue, indent = 0): string {
  const padding = " ".repeat(indent);

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (Array.isArray(item)) {
          return `${padding}-\n${renderYaml(item, indent + 2)}`;
        }

        if (isYamlObject(item)) {
          const renderedObject = renderYaml(item, indent + 2).split("\n");
          const [firstLine = "", ...restLines] = renderedObject;

          return [`${padding}- ${firstLine.trimStart()}`, ...restLines].join("\n");
        }

        return `${padding}- ${formatYamlScalar(item)}`;
      })
      .join("\n");
  }

  if (isYamlObject(value)) {
    return Object.entries(value)
      .map(([key, nestedValue]) => {
        if (Array.isArray(nestedValue) || isYamlObject(nestedValue)) {
          return `${padding}${key}:\n${renderYaml(nestedValue, indent + 2)}`;
        }

        return `${padding}${key}: ${formatYamlScalar(nestedValue)}`;
      })
      .join("\n");
  }

  return `${padding}${formatYamlScalar(value)}`;
}

export function getCompatibilityNotes(version: string) {
  if (version === "latest") {
    return [
      "Using latest version",
      "Newest screen and style properties are assumed to be available",
    ];
  }

  return [
    `Targeting Power Apps version ${version}`,
    "Some properties may differ in older versions",
  ];
}

export function generateYaml({
  screenGoal,
  version,
  theme,
}: GenerateYamlRequest): Pick<GenerateYamlResponse, "yaml" | "compatibilityNotes"> {
  const screenName = getScreenName(screenGoal);
  const goalText = screenGoal.trim() || "Describe the screen goal here.";

  return {
    yaml: `${renderYaml({
      Screen: {
        Name: screenName,
        Theme: theme.themeName,
        Version: version,
        Goal: goalText,
        Style: {
          PrimaryColor: theme.primaryColor,
          FontFamily: theme.fontFamily,
          CornerStyle: theme.cornerStyle,
        },
        Controls: [
          {
            Type: "Label",
            Name: "lblTitle",
            Text: screenName,
            X: 24,
            Y: 24,
          },
          {
            Type: "Label",
            Name: "lblGoal",
            Text: goalText,
            X: 24,
            Y: 64,
          },
        ],
      },
    }).trim()}\n`,
    compatibilityNotes: getCompatibilityNotes(version),
  };
}
