import type {
  DocumentationReference,
  GenerateYamlRequest,
  GenerateYamlResponse,
  ThemeProfile,
  ValidationWarning,
} from "@powerapp-yaml-studio/shared";
import { generateYaml } from "@powerapp-yaml-studio/shared";

type YamlScalar = string | number | boolean | null;
type YamlValue = YamlScalar | YamlObject | YamlValue[];

type YamlObject = {
  [key: string]: YamlValue;
};

function isYamlObject(value: YamlValue): value is YamlObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function buildMockYamlObject(screenGoal: string, version: string, theme: ThemeProfile): YamlObject {
  const result = generateYaml({ screenGoal, version, theme });

  return {
    Screen: {
      Goal: screenGoal,
      Version: version,
      Theme: theme.themeName,
      Raw: result.yaml,
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

  const themeName = typeof screen?.Theme === "string" ? screen.Theme.trim() : "";
  if (!themeName) {
    warnings.push({
      code: "missing_theme",
      message: "Generated YAML should include a Theme value when a theme profile is provided.",
    });
  }

  return warnings;
}

function buildCompatibilityNotes(
  request: GenerateYamlRequest,
  references: DocumentationReference[],
  groundingWarning?: string,
) {
  const baseNotes = generateYaml(request).compatibilityNotes;

  if (references.length > 0) {
    baseNotes.push(`Grounded with ${references.length} Microsoft Learn reference(s).`);
  }

  if (groundingWarning) {
    baseNotes.push("Microsoft Learn grounding was unavailable for this request.");
  }

  return baseNotes;
}

type GenerateYamlResponseOptions = {
  references?: DocumentationReference[];
  groundingWarning?: string;
};

export function generateYamlResponse(
  request: GenerateYamlRequest,
  options: GenerateYamlResponseOptions = {},
): GenerateYamlResponse {
  const { yaml } = generateYaml(request);
  const generatedObject = buildMockYamlObject(request.screenGoal, request.version, request.theme);

  return {
    yaml,
    compatibilityNotes: buildCompatibilityNotes(
      request,
      options.references ?? [],
      options.groundingWarning,
    ),
    validationWarnings: validateGeneratedYaml(yaml, generatedObject, request.theme),
    documentationReferences: options.references ?? [],
    groundingNote: options.groundingWarning,
  };
}
