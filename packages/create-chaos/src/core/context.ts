export interface CommandContext {
  root: string;
  targetDir: string;
  packageName: string;
  template: string;
  pkgManager: string;
  ignore?: string[];
  argTemplate?: string;
}
