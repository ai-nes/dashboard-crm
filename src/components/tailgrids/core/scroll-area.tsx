"use client";

import { cn } from "@/utils/cn";
import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area";
import { cva, type VariantProps } from "class-variance-authority";

const scrollBarStyles = cva(
  "flex touch-none rounded-full bg-transparent p-0.5 opacity-70 transition-opacity duration-200 select-none hover:opacity-100",
  {
    variants: {
      orientation: {
        vertical: "h-full w-2 border-0",
        horizontal: "h-2 w-full flex-col border-0",
      },
    },
    defaultVariants: {
      orientation: "vertical",
    },
  },
);

const scrollBarThumbStyles = cva(
  "relative flex-1 rounded-full bg-background-soft-500/80 transition-colors hover:bg-background-soft-500",
);

interface ScrollBarProps
  extends
    Omit<ScrollAreaPrimitive.Scrollbar.Props, "orientation">,
    VariantProps<typeof scrollBarStyles> {}

function ScrollArea({
  className,
  children,
  ...props
}: ScrollAreaPrimitive.Root.Props) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn("relative", className)}
      {...props}
    >
      {children}
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

function ScrollAreaViewport({
  className,
  children,
  ...props
}: ScrollAreaPrimitive.Viewport.Props) {
  return (
    <ScrollAreaPrimitive.Viewport
      data-slot="scroll-area-viewport"
      className={cn(
        "size-full rounded-[inherit] transition-[color,box-shadow] outline-none",
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.Content
        className="w-full min-w-0"
        style={{ minWidth: 0, width: "100%" }}
      >
        {children}
      </ScrollAreaPrimitive.Content>
    </ScrollAreaPrimitive.Viewport>
  );
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: ScrollBarProps) {
  return (
    <ScrollAreaPrimitive.Scrollbar
      data-slot="scroll-area-scrollbar"
      data-orientation={orientation || "vertical"}
      orientation={orientation || "vertical"}
      className={cn(scrollBarStyles({ orientation }), className)}
      {...props}
    >
      <ScrollAreaPrimitive.Thumb
        data-slot="scroll-area-thumb"
        className={cn(scrollBarThumbStyles(), className)}
      />
    </ScrollAreaPrimitive.Scrollbar>
  );
}

export { ScrollArea, ScrollAreaViewport, ScrollBar };
