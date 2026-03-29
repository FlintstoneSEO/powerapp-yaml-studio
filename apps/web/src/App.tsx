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
import {
  generateYaml,
  type GenerateYamlResponse,
  type ThemeProfile,
} from "../../../packages/shared/src";

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

const defaultTheme: ThemeProfile = {
  themeName: "ContosoBlue",
  primaryColor: "#115EA3",
  fontFamily: "Segoe UI",
  cornerStyle: "rounded",
};

const initialGeneration = generateYaml({
  screenGoal: defaultScreenGoal,
  version: "latest",
  theme: defaultTheme,
});

function App() {
  const [screenGoal, setScreenGoal] = useState(defaultScreenGoal);
  const [version, setVersion] = useState("latest");
  const [themeName, setThemeName] = useState(defaultTheme.themeName);
  const [primaryColor, setPrimaryColor] = useState(defaultTheme.primaryColor);
  const [fontFamily, setFontFamily] = useState(defaultTheme.fontFamily);
  const [cornerStyle, setCornerStyle] = useState(defaultTheme.cornerStyle);
  const [yamlOutput, setYamlOutput] = useState(initialGeneration.yaml);
  const [compatibilityNotes, setCompatibilityNotes] = useState(initialGeneration.compatibilityNotes);
  const [copyStatus, setCopyStatus] = useState<"idle" | "success" | "error">("idle");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

  async function handleGenerateClick() {
    if (isGenerateDisabled) {
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          screenGoal,
          version,
          theme: {
            themeName,
            primaryColor,
            fontFamily,
            cornerStyle,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to generate YAML right now. Please try again.");
      }

      const payload = (await response.json()) as GenerateYamlResponse;
      setYamlOutput(payload.yaml);
      setCompatibilityNotes(payload.compatibilityNotes);
    } catch {
      setErrorMessage("Unable to generate YAML right now. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
        <Button
          appearance="primary"
          onClick={handleGenerateClick}
          disabled={isGenerateDisabled || isLoading}
        >
          {isLoading ? "Generating YAML..." : "Generate YAML"}
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
              {errorMessage ? <Body1 role="alert">{errorMessage}</Body1> : null}
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
