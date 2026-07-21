import { Reveal } from "@/components/shared/reveal";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex max-w-2xl flex-col gap-4",
        align === "center" && "mx-auto items-center text-center",
      )}
    >
      {eyebrow && (
        <Reveal direction="scale">
          <Badge variant="primary">{eyebrow}</Badge>
        </Reveal>
      )}
      <Reveal delay={80}>
        <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {title}
        </h2>
      </Reveal>
      {description && (
        <Reveal delay={160}>
          <p className="text-muted-foreground text-lg text-pretty">
            {description}
          </p>
        </Reveal>
      )}
    </div>
  );
}
