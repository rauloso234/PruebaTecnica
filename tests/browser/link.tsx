import type { ComponentProps } from "react";

// Browser harness only. The application's next/link imports are unchanged.
export default function Link(props: ComponentProps<"a">) {
  return <a {...props} />;
}
