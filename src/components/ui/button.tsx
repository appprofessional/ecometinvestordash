import * as React from "react";
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { className?: string };
export function Button({ className = "", ...props }: Props) {
  const base = "inline-flex items-center justify-center rounded-2xl px-3 py-2 text-sm font-medium transition";
  return <button className={`${base} ${className}`} {...props} />;
}
