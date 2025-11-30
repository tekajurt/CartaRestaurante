"use client";

import { useFormStatus } from "react-dom";
import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type Props = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & { labelLoading?: string }
>;

export default function ActionButton({
  children,
  className,
  labelLoading = "Guardando...",
  ...rest
}: Props) {
  const { pending } = useFormStatus();

  return (
    <button
      {...rest}
      className={
        (className ?? "") +
        (pending ? " opacity-70 cursor-not-allowed" : "")
      }
      disabled={pending || rest.disabled}
    >
      {pending ? (
        <span className="inline-flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"></span>
          {labelLoading}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
