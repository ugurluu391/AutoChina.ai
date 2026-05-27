"use client";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FieldError, FormError } from "@/components/ui/form-error";
import { upsertSeller, type SellerActionState } from "@/lib/actions/seller-actions";

type Defaults = { shopName?: string; description?: string | null; city?: string | null; phone?: string | null; whatsapp?: string | null };

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full">
      {pending ? <><Loader2 size={16} className="animate-spin" /> Yadda saxlanılır...</> : "Profili yadda saxla"}
    </Button>
  );
}

export function SellerForm({ defaults = {} }: { defaults?: Defaults }) {
  const [state, formAction] = useActionState<SellerActionState, FormData>(upsertSeller, {});
  return (
    <form action={formAction} className="space-y-5">
      {state.error && <FormError message={state.error} />}
      {state.success && <div className="p-3 rounded-[var(--radius-sm)] bg-[rgba(52,211,153,.12)] border border-[rgba(52,211,153,.3)] text-[var(--success)] text-sm">Profil yadda saxlanıldı ✓</div>}
      <div>
        <Label>Mağaza adı</Label>
        <Input name="shopName" defaultValue={defaults.shopName} placeholder="AutoParts Baku" required />
        <FieldError errors={state.fieldErrors?.shopName} />
      </div>
      <div>
        <Label>Təsvir</Label>
        <textarea name="description" defaultValue={defaults.description ?? ""} rows={3}
          placeholder="Mağazanız haqqında qısa məlumat..."
          className="w-full bg-surface border border-[var(--border)] rounded-[var(--radius-sm)] px-4 py-3 text-sm text-content outline-none focus:border-[var(--border-glow)] resize-none" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label>Şəhər</Label>
          <Input name="city" defaultValue={defaults.city ?? ""} placeholder="Bakı" />
        </div>
        <div>
          <Label>Telefon</Label>
          <Input name="phone" defaultValue={defaults.phone ?? ""} placeholder="+994 50 123 45 67" />
        </div>
      </div>
      <div>
        <Label>WhatsApp nömrəsi (kodla, məs: 994501234567)</Label>
        <Input name="whatsapp" defaultValue={defaults.whatsapp ?? ""} placeholder="994501234567" />
        <FieldError errors={state.fieldErrors?.whatsapp} />
      </div>
      <SubmitBtn />
    </form>
  );
}
