import { cn } from "@docs/utils/utils";
import type { ReactNode } from "react";

type PreviewRenderProps = {
  children: ReactNode;
  width?: string | number;
  height?: string | number;
};

export const PreviewRender = ({
  children,
  width,
  height,
}: PreviewRenderProps) => (
  <div className="not-prose frame-box relative flex size-full flex-col items-center justify-center gap-4 overflow-hidden border-none p-8 [--primary-foreground:oklch(0.985_0_0)] [--primary:oklch(0.205_0_0)] dark:[--primary-foreground:oklch(0.205_0_0)] dark:[--primary:oklch(0.985_0_0)]">
    <div
      className={cn(
        "relative z-1 flex flex-col items-center justify-center gap-4",
        !width && "size-full",
        (width || height) && "overflow-auto border bg-background shadow-sm"
      )}
      style={{
        width: width,
        height: height,
      }}
    >
      {children}
    </div>
  </div>
);
