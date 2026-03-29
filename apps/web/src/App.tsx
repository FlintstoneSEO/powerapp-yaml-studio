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

const sampleYaml = `Screen:
  Name: HomeScreen
  Theme: ContosoBlue
  Controls:
    - Type: Label
      Name: lblTitle
      Text: "Welcome to PowerApp YAML Studio"
      X: 24
      Y: 32`;

function App() {
  return (
    <div className="studio-shell">
      <header className="top-header">
        <div className="header-copy">
          <Text className="product-eyebrow">PowerApp tooling</Text>
          <Title2 as="h1" className="product-title">
            PowerApp YAML Studio
          </Title2>
          <Body1 className="product-subtitle">
            Guided YAML generation for polished Power Apps screens.
          </Body1>
        </div>
        <Button appearance="primary" className="header-action">
          Generate YAML
        </Button>
      </header>

      <main className="content-grid">
        <section className="left-column" aria-label="Prompt builder and theme profile">
          <Card className="panel-card">
            <CardHeader
              header={<Subtitle2 as="h2">Prompt Builder</Subtitle2>}
              description={<Body1>Describe the app screen you want to generate.</Body1>}
            />
            <div className="card-content">
              <Field label="Screen goal">
                <Textarea
                  resize="vertical"
                  defaultValue="Create a simple home screen with a welcome message and one action button."
                  rows={7}
                />
              </Field>
              <Field label="Power Apps version">
                <Dropdown defaultValue="Latest" defaultSelectedOptions={["latest"]}>
                  <Option value="latest">Latest</Option>
                  <Option value="3.24031">3.24031</Option>
                  <Option value="3.24022">3.24022</Option>
                </Dropdown>
              </Field>
            </div>
          </Card>

          <Card className="panel-card">
            <CardHeader
              header={<Subtitle2 as="h2">Theme Profile</Subtitle2>}
              description={<Body1>Set visual defaults applied to generated YAML.</Body1>}
            />
            <div className="card-content two-up">
              <Field label="Theme name">
                <Input defaultValue="ContosoBlue" />
              </Field>
              <Field label="Primary color">
                <Input defaultValue="#115EA3" />
              </Field>
              <Field label="Font family">
                <Input defaultValue="Segoe UI" />
              </Field>
              <Field label="Corner style">
                <Dropdown defaultValue="Rounded" defaultSelectedOptions={["rounded"]}>
                  <Option value="rounded">Rounded</Option>
                  <Option value="soft">Soft</Option>
                  <Option value="square">Square</Option>
                </Dropdown>
              </Field>
            </div>
          </Card>
        </section>

        <section className="right-column" aria-label="Generated YAML and compatibility notes">
          <Card className="panel-card yaml-panel">
            <CardHeader
              header={<Subtitle2 as="h2">Generated YAML</Subtitle2>}
              description={<Body1>Ready to copy into Power Apps Studio.</Body1>}
            />
            <div className="card-content">
              <Field label="YAML output">
                <Textarea
                  className="yaml-output"
                  readOnly
                  resize="vertical"
                  value={sampleYaml}
                  rows={12}
                />
              </Field>
            </div>
          </Card>

          <Card className="panel-card">
            <CardHeader
              header={<Subtitle2 as="h2">Compatibility Notes</Subtitle2>}
              description={<Body1>Version-aware checks appear here.</Body1>}
            />
            <div className="card-content">
              <Body1Strong>Current status</Body1Strong>
              <ul className="notes-list">
                <li>
                  <Body1>Layout properties align with Power Apps version 3.24031.</Body1>
                </li>
                <li>
                  <Body1>Theme values are mapped to supported token names.</Body1>
                </li>
                <li>
                  <Body1>Warnings will appear here when feature support is uncertain.</Body1>
                </li>
              </ul>
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
}

export default App;
