import { AlertCircle } from "lucide-react";

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-2 text-[13px] text-red-300 bg-red-500/10 border border-red-500/25 rounded-[var(--radius-sm)] px-3.5 py-2.5">
      <AlertCircle size={15} className="shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="text-[12px] text-red-300 mt-1">{errors[0]}</p>;
}
