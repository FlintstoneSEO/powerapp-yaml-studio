import type {
  GenerateYamlRequest,
  GenerateYamlResponse,
  ThemeProfile,
  ValidationWarning,
} from "@powerapp-yaml-studio/shared";

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

function getCompatibilityNotes(version: string) {
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

function buildMockYaml(screenGoal: string, version: string, theme: ThemeProfile): YamlObject {
  const goalText = screenGoal.trim() || "Describe the screen goal here.";

  return {
    Screen: {
      Name: getScreenName(screenGoal),
      Theme: theme.themeName.trim(),
      Version: version,
      Goal: goalText,
      Style: {
        PrimaryColor: theme.primaryColor.trim(),
        FontFamily: theme.fontFamily.trim(),
        CornerStyle: theme.cornerStyle.trim(),
      },
      Controls: [
        {
          Type: "Label",
          Name: "lblTitle",
          Text: "Welcome",
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
  };
}

function validateGeneratedYaml(yaml: string, generatedObject: YamlObject, _theme: ThemeProfile) {
  const warnings: ValidationWarning[] = [];
  const screen = isYamlObject(generatedObject.Screen) ? generatedObject.Screen : undefined;

  if (!yaml.trim()) {
    warnings.push({
      code: "empty_yaml",
      message: "Generated YAML is empty.",
    });
  }

  if (!screen || !/^Screen:\s*$/m.test(yaml)) {
    warnings.push({
      code: "missing_screen",
      message: "Generated YAML should include a top-level Screen section.",
    });
  }

  const screenName = typeof screen?.Name === "string" ? screen.Name.trim() : "";
  if (!screenName) {
    warnings.push({
      code: "missing_name",
      message: "Generated YAML should include a Screen Name value.",
    });
  }

  const themeName = typeof screen?.Theme === "string" ? screen.Theme.trim() : "";
  if (!themeName) {
    warnings.push({
      code: "missing_theme",
      message: "Generated YAML should include a Theme value when a theme profile is provided.",
    });
  }

  return warnings;
}

export function generateYamlResponse(request: GenerateYamlRequest): GenerateYamlResponse {
  const generatedObject = buildMockYaml(request.screenGoal, request.version, request.theme);
  const yaml = `${renderYaml(generatedObject).trim()}\n`;

  return {
    yaml,
    compatibilityNotes: getCompatibilityNotes(request.version),
    validationWarnings: validateGeneratedYaml(yaml, generatedObject, request.theme),
  };
}
