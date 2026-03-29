import {
  Body1,
  Body1Strong,
  Button,
  Card,
  CardHeader,
  Dropdown,
  Field,
  Input,
  Option,
  Subtitle2,
  Text,
  Textarea,
  Title2,
} from "@fluentui/react-components";
import { useEffect, useState } from "react";

const versionOptions = [
  { value: "latest", label: "Latest" },
  { value: "3.24031", label: "3.24031" },
  { value: "3.24022", label: "3.24022" },
] as const;

const cornerOptions = [
  { value: "rounded", label: "Rounded" },
  { value: "soft", label: "Soft" },
  { value: "square", label: "Square" },
] as const;

const defaultScreenGoal =
  "Create a simple home screen with a welcome message and one action button.";

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

function generateYaml({
  screenGoal,
  version,
  themeName,
  primaryColor,
  fontFamily,
  cornerStyle,
}: {
  screenGoal: string;
  version: string;
  themeName: string;
  primaryColor: string;
  fontFamily: string;
  cornerStyle: string;
}) {
  const screenName = getScreenName(screenGoal);
  const goalText = screenGoal.trim() || "Describe the screen goal here.";

  return renderYaml({
    Screen: {
      Name: screenName,
      Theme: themeName,
      Version: version,
      Goal: goalText,
      Style: {
        PrimaryColor: primaryColor,
        FontFamily: fontFamily,
        CornerStyle: cornerStyle,
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
  });
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

function App() {
  const [screenGoal, setScreenGoal] = useState(defaultScreenGoal);
  const [version, setVersion] = useState("latest");
  const [themeName, setThemeName] = useState("ContosoBlue");
  const [primaryColor, setPrimaryColor] = useState("#115EA3");
  const [fontFamily, setFontFamily] = useState("Segoe UI");
  const [cornerStyle, setCornerStyle] = useState("rounded");
  const [yamlOutput, setYamlOutput] = useState(
    generateYaml({
      screenGoal: defaultScreenGoal,
      version: "latest",
      themeName: "ContosoBlue",
      primaryColor: "#115EA3",
      fontFamily: "Segoe UI",
      cornerStyle: "rounded",
    }),
  );
  const [copyStatus, setCopyStatus] = useState<"idle" | "success" | "error">("idle");

  const compatibilityNotes = getCompatibilityNotes(version);
  const selectedVersionLabel =
    versionOptions.find((option) => option.value === version)?.label ?? "Latest";
  const selectedCornerLabel =
    cornerOptions.find((option) => option.value === cornerStyle)?.label ?? "Rounded";
  const trimmedScreenGoal = screenGoal.trim();
  const isGenerateDisabled = trimmedScreenGoal.length === 0;
  const screenGoalValidationMessage = isGenerateDisabled
    ? "Enter a screen goal to generate YAML."
    : undefined;

  useEffect(() => {
    if (copyStatus === "idle") {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setCopyStatus("idle");
    }, 1800);

    return () => window.clearTimeout(timeoutId);
  }, [copyStatus]);

  function handleGenerateClick() {
    if (isGenerateDisabled) {
      return;
    }

    setYamlOutput(
      generateYaml({
        screenGoal,
        version,
        themeName,
        primaryColor,
        fontFamily,
        cornerStyle,
      }),
    );
  }

  async function handleCopyYaml() {
    try {
      await navigator.clipboard.writeText(yamlOutput);
      setCopyStatus("success");
    } catch {
      setCopyStatus("error");
    }
  }

  return (
    <div className="studio-shell">
      <header className="top-header">
        <div>
          <Text className="product-eyebrow">PowerApp tooling</Text>
          <Title2 as="h1">PowerApp YAML Studio</Title2>
        </div>
        <Button appearance="primary" onClick={handleGenerateClick} disabled={isGenerateDisabled}>
          Generate YAML
        </Button>
      </header>

      <main className="content-grid">
        <section className="left-column" aria-label="Prompt builder and theme profile">
          <Card>
            <CardHeader
              header={<Subtitle2 as="h2">Prompt Builder</Subtitle2>}
              description={<Body1>Describe the app screen you want to generate.</Body1>}
            />
            <div className="card-content">
              <Field
                label="Screen goal"
                validationMessage={screenGoalValidationMessage}
                validationState={isGenerateDisabled ? "error" : "none"}
              >
                <Textarea
                  value={screenGoal}
                  onChange={(_, data) => setScreenGoal(data.value)}
                  resize="vertical"
                  rows={7}
                />
              </Field>
              <Field label="Power Apps version">
                <Dropdown
                  value={selectedVersionLabel}
                  selectedOptions={[version]}
                  onOptionSelect={(_, data) => {
                    if (data.optionValue) {
                      setVersion(data.optionValue);
                    }
                  }}
                >
                  <Option value="latest">Latest</Option>
                  <Option value="3.24031">3.24031</Option>
                  <Option value="3.24022">3.24022</Option>
                </Dropdown>
              </Field>
            </div>
          </Card>

          <Card>
            <CardHeader
              header={<Subtitle2 as="h2">Theme Profile</Subtitle2>}
              description={<Body1>Set visual defaults applied to generated YAML.</Body1>}
            />
            <div className="card-content two-up">
              <Field label="Theme name">
                <Input value={themeName} onChange={(_, data) => setThemeName(data.value)} />
              </Field>
              <Field label="Primary color">
                <Input value={primaryColor} onChange={(_, data) => setPrimaryColor(data.value)} />
              </Field>
              <Field label="Font family">
                <Input value={fontFamily} onChange={(_, data) => setFontFamily(data.value)} />
              </Field>
              <Field label="Corner style">
                <Dropdown
                  value={selectedCornerLabel}
                  selectedOptions={[cornerStyle]}
                  onOptionSelect={(_, data) => {
                    if (data.optionValue) {
                      setCornerStyle(data.optionValue);
                    }
                  }}
                >
                  <Option value="rounded">Rounded</Option>
                  <Option value="soft">Soft</Option>
                  <Option value="square">Square</Option>
                </Dropdown>
              </Field>
            </div>
          </Card>
        </section>

        <section className="right-column" aria-label="Generated YAML and compatibility notes">
          <Card>
            <CardHeader
              header={<Subtitle2 as="h2">Generated YAML</Subtitle2>}
              description={<Body1>Ready to copy into Power Apps Studio.</Body1>}
            />
            <div className="card-content">
              <div className="yaml-toolbar">
                <Button appearance="secondary" onClick={handleCopyYaml} disabled={!yamlOutput}>
                  Copy YAML
                </Button>
                {copyStatus === "success" ? (
                  <Text className="copy-feedback success">Copied!</Text>
                ) : null}
                {copyStatus === "error" ? (
                  <Text className="copy-feedback error">Copy failed</Text>
                ) : null}
              </div>
              <Field label="YAML output">
                <Textarea readOnly resize="vertical" value={yamlOutput} rows={12} />
              </Field>
            </div>
          </Card>

          <Card>
            <CardHeader
              header={<Subtitle2 as="h2">Compatibility Notes</Subtitle2>}
              description={<Body1>Version-aware checks appear here.</Body1>}
            />
            <div className="card-content">
              <Body1Strong>Current status</Body1Strong>
              <ul className="notes-list">
                {compatibilityNotes.map((note) => (
                  <li key={note}>
                    <Body1>{note}</Body1>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
}

export default App;
