import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";
import { Slot } from "@radix-ui/react-slot";
import { forwardRef } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium ring-offset-neutral-300 dark:ring-offset-neutral-600 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-neutral-200 shadow-md text-neutral-950 hover:bg-white dark:hover:bg-black dark:bg-neutral-900 dark:text-neutral-100  ",
        delete: "bg-red-700 text-red-100 hover:bg-red-800",
        outline: "bg-neutral-200 border border-neutral-800 focus-visible:border-0 text-neutral-900 hover:bg-white",
        link: "text-neutral-800 dark:text-neutral-200 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        icon: "h-10 w-10",
        small: "h-9 rounded-md px-3",
        large: "h-11 rounded-md px-8",
        superLarge: "h-14 rounded-lg px-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = "Button";

export default Button;
