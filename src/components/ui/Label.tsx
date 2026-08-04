import * as RadixLabel from "@radix-ui/react-label";
import { cn } from "@/utils/cn";

interface LabelProps extends RadixLabel.LabelProps {
  required?: boolean;
}

export function Label({ className, required, children, ...props }: LabelProps) {
  return (
    <RadixLabel.Root className={cn("mb-1.5 block text-sm font-medium text-ink", className)} {...props}>
      {children}
      {required ? <span className="text-danger"> *</span> : null}
    </RadixLabel.Root>
  );
}
