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
import type {
  ApiErrorResponse,
  DocumentationReference,
  GenerateYamlRequest,
  ValidationWarning,
} from "@powerapp-yaml-studio/shared";
import { generateYaml, type ThemeProfile, type GenerateYamlResponse } from "@powerapp-yaml-studio/shared";

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

const emptyWarnings: ValidationWarning[] = [];
const emptyReferences: DocumentationReference[] = [];

async function requestGeneratedYaml(payload: GenerateYamlRequest) {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as ApiErrorResponse | null;
    throw new Error(errorPayload?.error.message ?? "Unable to generate YAML right now.");
  }

  return (await response.json()) as GenerateYamlResponse;
}

function App() {
  const [screenGoal, setScreenGoal] = useState(defaultScreenGoal);
  const [version, setVersion] = useState("latest");
  const [themeName, setThemeName] = useState(defaultTheme.themeName);
  const [primaryColor, setPrimaryColor] = useState(defaultTheme.primaryColor);
  const [fontFamily, setFontFamily] = useState(defaultTheme.fontFamily);
  const [cornerStyle, setCornerStyle] = useState(defaultTheme.cornerStyle);
  const [yamlOutput, setYamlOutput] = useState(initialGeneration.yaml);
  const [compatibilityNotes, setCompatibilityNotes] = useState(initialGeneration.compatibilityNotes);
  const [validationWarnings, setValidationWarnings] = useState<ValidationWarning[]>(emptyWarnings);
  const [documentationReferences, setDocumentationReferences] =
    useState<DocumentationReference[]>(emptyReferences);
  const [groundingNote, setGroundingNote] = useState("");
  const [generationError, setGenerationError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "success" | "error">("idle");

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

  useEffect(() => {
    void handleGenerateClick();
  }, []);

  async function handleGenerateClick() {
    if (isGenerateDisabled) {
      return;
    }

    setIsGenerating(true);
    setGenerationError("");

    try {
      const response = await requestGeneratedYaml({
        screenGoal,
        version,
        theme: {
          themeName,
          primaryColor,
          fontFamily,
          cornerStyle,
        },
      });

      setYamlOutput(response.yaml);
      setCompatibilityNotes(response.compatibilityNotes);
      setValidationWarnings(response.validationWarnings);
      setDocumentationReferences(response.documentationReferences);
      setGroundingNote(response.groundingNote ?? "");
    } catch (error) {
      setYamlOutput("");
      setCompatibilityNotes([]);
      setValidationWarnings(emptyWarnings);
      setDocumentationReferences(emptyReferences);
      setGroundingNote("");
      setGenerationError(
        error instanceof Error ? error.message : "Unable to generate YAML right now.",
      );
    } finally {
      setIsGenerating(false);
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
          onClick={() => void handleGenerateClick()}
          disabled={isGenerateDisabled || isGenerating}
        >
          {isGenerating ? "Generating..." : "Generate YAML"}
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

              {generationError ? (
                <div className="message-panel error-panel" role="alert">
                  <Body1Strong>Generation error</Body1Strong>
                  <Body1>{generationError}</Body1>
                </div>
              ) : null}

              <Field label="YAML output">
                <Textarea readOnly resize="vertical" value={yamlOutput} rows={12} />
              </Field>

              {validationWarnings.length > 0 ? (
                <div className="message-panel warning-panel" role="status">
                  <Body1Strong>Validation warnings</Body1Strong>
                  <ul className="notes-list">
                    {validationWarnings.map((warning) => (
                      <li key={warning.code}>
                        <Body1>{warning.message}</Body1>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
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

          <Card>
            <CardHeader
              header={<Subtitle2 as="h2">Documentation References</Subtitle2>}
              description={<Body1>Grounding context from Microsoft Learn MCP.</Body1>}
            />
            <div className="card-content">
              {groundingNote ? <Body1>{groundingNote}</Body1> : null}
              {documentationReferences.length === 0 ? (
                <Body1>No documentation references were returned for this request.</Body1>
              ) : (
                <ul className="notes-list">
                  {documentationReferences.map((reference, index) => (
                    <li key={`${reference.source}-${index}`}>
                      <Body1Strong>{reference.title}</Body1Strong>
                      <Body1>{reference.summary}</Body1>
                      <Text>{reference.source}</Text>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
}

export default App;
