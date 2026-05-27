"use client";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { loginAction, type ActionState } from "@/lib/actions/auth-actions";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormError, FieldError } from "@/components/ui/form-error";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? <><Loader2 size={16} className="animate-spin" /> Yoxlanılır...</> : "Daxil ol"}
    </Button>
  );
}

export function LoginForm() {
  const [state, action] = useActionState<ActionState, FormData>(loginAction, {});
  return (
    <form action={action} className="space-y-4">
      <FormError message={state.error} />
      <div>
        <Label>E-poçt</Label>
        <Input type="email" name="email" placeholder="ad@nümunə.com" autoComplete="email" required />
        <FieldError errors={state.fieldErrors?.email} />
      </div>
      <div>
        <Label>Şifrə</Label>
        <Input type="password" name="password" placeholder="••••••••" autoComplete="current-password" required />
        <FieldError errors={state.fieldErrors?.password} />
      </div>
      <SubmitButton />
    </form>
  );
}
