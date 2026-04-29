"use client";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const base =
      "relative inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber disabled:opacity-50 disabled:pointer-events-none ring-offset-background overflow-hidden";

    const variants: Record<ButtonVariant, string> = {
      primary:
        "bg-amber text-white shadow-[0_4px_14px_rgba(232,147,90,0.39)] after:absolute after:inset-0 after:rounded-lg after:opacity-0 after:transition-opacity hover:after:opacity-100 after:shadow-[0_0_20px_6px_rgba(232,147,90,0.35)]",
      secondary:
        "bg-teal text-midnight shadow-md hover:bg-[#34BFA4]",
      outline:
        "border border-amber/30 hover:bg-amber/10 text-amber",
      ghost:
        "hover:bg-amber/10 text-midnight dark:text-ivory",
    };

    const sizes: Record<ButtonSize, string> = {
      sm: "h-9 px-4 text-sm",
      md: "h-11 px-6 text-base",
      lg: "h-14 px-8 text-lg",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.04, y: -1 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className={cn(base, variants[variant], sizes[size], className)}
        {...(props as HTMLMotionProps<"button">)}
      >
        {children}
      </motion.button>
    );
  }
);
Button.displayName = "Button";
