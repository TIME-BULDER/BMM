import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type AvatarProps = ComponentProps<"div"> & {
  initials: string;
  src?: string;
  alt?: string;
};

export function Avatar({
  className,
  initials,
  src,
  alt,
  ...props
}: AvatarProps) {
  return (
    <div
      className={cn(
        "bg-secondary text-secondary-foreground relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-medium",
        className,
      )}
      {...props}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt ?? initials}
          className="size-full object-cover"
        />
      ) : (
        initials
      )}
    </div>
  );
}
