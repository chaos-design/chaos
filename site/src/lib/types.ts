export interface ChaosTemplate {
  id: string;
  alias: string;
  category: string;
  categoryLabel: string;
  title: string;
  description: string;
  /** kolorist color name, e.g. "cyan", "magenta" — matches config.ts. */
  color: string;
}
