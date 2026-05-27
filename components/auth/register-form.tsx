"use client";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { registerAction, type ActionState } from "@/lib/actions/auth-actions";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormError, FieldError } from "@/components/ui/form-error";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? <><Loader2 size={16} className="animate-spin" /> Yaradılır...</> : "Qeydiyyatdan keç"}
    </Button>
  );
}

export function RegisterForm() {
  const [state, action] = useActionState<ActionState, FormData>(registerAction, {});
  return (
    <form action={action} className="space-y-4">
      <FormError message={state.error} />
      <div>
        <Label>Ad Soyad</Label>
        <Input type="text" name="name" placeholder="Elvin Məmmədov" autoComplete="name" required />
        <FieldError errors={state.fieldErrors?.name} />
      </div>
      <div>
        <Label>E-poçt</Label>
        <Input type="email" name="email" placeholder="ad@nümunə.com" autoComplete="email" required />
        <FieldError errors={state.fieldErrors?.email} />
      </div>
      <div>
        <Label>Şifrə</Label>
        <Input type="password" name="password" placeholder="Ən azı 6 simvol, hərf+rəqəm" autoComplete="new-password" required />
        <FieldError errors={state.fieldErrors?.password} />
      </div>
      <div>
        <Label>Şifrəni təkrarla</Label>
        <Input type="password" name="confirmPassword" placeholder="••••••••" autoComplete="new-password" required />
        <FieldError errors={state.fieldErrors?.confirmPassword} />
      </div>
      <SubmitButton />
    </form>
  );
}
