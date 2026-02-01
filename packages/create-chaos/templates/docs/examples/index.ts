export const registry: Record<
  string,
  () => Promise<{ default: React.ComponentType }>
> = {
  foo: () => import("./foo.tsx"),
};
