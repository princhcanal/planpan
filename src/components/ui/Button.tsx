import React from "react";
import { Spinner } from "./Spinner";

interface ButtonProps {
  isLoading?: boolean;
  className?: string;
}

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.PropsWithChildren<
    React.ButtonHTMLAttributes<HTMLButtonElement> & ButtonProps
  >
>(({ children, isLoading, className, ...props }, ref) => {
  return (
    <button
      disabled={isLoading}
      ref={ref}
      className={`flex items-center rounded-md bg-indigo-400 p-2 text-white shadow-md transition hover:bg-indigo-500 disabled:bg-indigo-300 ${className}`}
      {...props}
    >
      {isLoading && <Spinner />}
      {children}
    </button>
  );
});

Button.displayName = "Button";
