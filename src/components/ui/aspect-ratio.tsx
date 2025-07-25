import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio";

/**
 * A React component that renders an aspect ratio container using Radix UI, forwarding all props and adding a `data-slot="aspect-ratio"` attribute.
 */
function AspectRatio({ ...props }: React.ComponentProps<typeof AspectRatioPrimitive.Root>) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />;
}

export { AspectRatio };
