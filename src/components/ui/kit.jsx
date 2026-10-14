"use client";

import { forwardRef, useId } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/cn";

const BUTTON = {
  primary: "bg-teal-700 text-white hover:bg-teal-800 disabled:bg-teal-700/50",
  secondary: "bg-white text-ink ring-1 ring-line hover:bg-mint disabled:text-muted",
  ghost: "text-teal-700 hover:bg-mint disabled:text-muted",
  danger: "bg-coral-700 text-white hover:bg-[#9a3627] disabled:bg-coral-700/50",
};
const SIZE = {
  sm: "h-9 px-3 text-sm rounded-lg gap-1.5",
  md: "h-11 px-4 text-[15px] rounded-xl gap-2",
  lg: "h-14 px-6 text-base rounded-2xl gap-2",
};

export const Button = forwardRef(function Button(
  { variant = "primary", size = "md", loading = false, className, children, disabled, type = "button", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-dm-sans font-bold transition-colors disabled:cursor-not-allowed",
        BUTTON[variant],
        SIZE[size],
        className
      )}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin" aria-hidden />}
      {children}
    </button>
  );
});

export function Field({ label, hint, error, children, className }) {
  const id = useId();
  const child = typeof children === "function" ? children(id) : children;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={id} className="font-dm-sans text-sm font-bold text-ink">
          {label}
        </label>
      )}
      {child}
      {hint && !error && <p className="font-dm-sans text-[13px] text-muted">{hint}</p>}
      {error && (
        <p role="alert" className="font-dm-sans text-[13px] font-medium text-coral-700">
          {error}
        </p>
      )}
    </div>
  );
}

const INPUT = "w-full h-11 rounded-xl bg-white px-3.5 font-dm-sans text-[15px] text-ink ring-1 ring-line placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-teal-700 transition-shadow";

export const Input = forwardRef(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn(INPUT, className)} {...props} />;
});

export const Textarea = forwardRef(function Textarea({ className, ...props }, ref) {
  return <textarea ref={ref} className={cn(INPUT, "h-auto min-h-24 py-2.5 leading-relaxed", className)} {...props} />;
});

export const Select = forwardRef(function Select({ className, children, ...props }, ref) {
  return (
    <select ref={ref} className={cn(INPUT, "pr-8", className)} {...props}>
      {children}
    </select>
  );
});

export function Toggle({ checked, onChange, label, description, disabled }) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0">
        <label htmlFor={id} className="font-dm-sans text-[15px] font-bold text-ink">
          {label}
        </label>
        {description && <p className="font-dm-sans text-[13px] text-muted mt-0.5 max-w-prose">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative shrink-0 w-12 h-7 rounded-full transition-colors disabled:opacity-50",
          checked ? "bg-teal-700" : "bg-[#C5D3CF]"
        )}
      >
        <span
          className={cn(
            "absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow transition-transform",
            checked && "translate-x-5"
          )}
        />
      </button>
    </div>
  );
}

export function Segmented({ value, onChange, options, label }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-xl bg-mint p-1 gap-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "h-9 px-3.5 rounded-lg font-dm-sans text-sm font-bold transition-colors",
            value === o.value ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Card({ title, action, children, className, as: Tag = "section" }) {
  return (
    <Tag className={cn("card p-5 md:p-6 flex flex-col", className)}>
      {(title || action) && (
        <header className="flex items-start justify-between gap-3 mb-4">
          {title && <h2 className="font-nunito font-bold text-lg text-ink text-balance">{title}</h2>}
          {action}
        </header>
      )}
      {children}
    </Tag>
  );
}

export function EmptyState({ children }) {
  return <p className="font-dm-sans text-sm text-muted py-6 text-center">{children}</p>;
}

/** Four-digit PIN pad with big targets, used to lock/unlock child mode. */
export function PinPad({ value, onChange, length = 4 }) {
  const press = (d) => value.length < length && onChange(value + d);
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex gap-3" aria-label={`${value.length} of ${length} digits entered`}>
        {Array.from({ length }).map((_, i) => (
          <span key={i} className={cn("w-4 h-4 rounded-full", i < value.length ? "bg-teal-700" : "bg-line")} />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"].map((k, i) =>
          k === "" ? (
            <span key={i} />
          ) : (
            <button
              key={i}
              type="button"
              aria-label={k === "⌫" ? "Delete digit" : k}
              onClick={() => (k === "⌫" ? onChange(value.slice(0, -1)) : press(k))}
              className="w-16 h-16 rounded-2xl bg-white ring-1 ring-line font-sora text-2xl font-semibold text-ink hover:bg-mint active:bg-teal-100 tabular"
            >
              {k === "⌫" ? "←" : k}
            </button>
          )
        )}
      </div>
    </div>
  );
}
