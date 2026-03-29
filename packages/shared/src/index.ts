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

export type GenerateYamlResponse = {
  yaml: string;
  compatibilityNotes: string[];
  validationWarnings: ValidationWarning[];
};

export type ApiErrorResponse = {
  error: {
    message: string;
  };
};
