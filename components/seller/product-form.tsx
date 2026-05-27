"use client";
import { useActionState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FieldError, FormError } from "@/components/ui/form-error";
import { ImageUploader } from "@/components/seller/image-uploader";
import { AiListingGenerator, type GeneratedListing } from "@/components/seller/ai-listing-generator";
import type { ProductActionState } from "@/lib/actions/product-actions";

type Option = { id: string; name: string };

type Defaults = {
  title?: string; description?: string; price?: number; oldPrice?: number | null;
  partNumber?: string | null; condition?: string; stockCount?: number; carModel?: string | null;
  categoryId?: string; brandId?: string; status?: string; images?: string[];
};

function SubmitBtn({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full">
      {pending ? <><Loader2 size={16} className="animate-spin" /> Yadda saxlanılır...</> : label}
    </Button>
  );
}

export function ProductForm({
  action,
  brands,
  categories,
  defaults = {},
  submitLabel = "Məhsulu yayımla",
}: {
  action: (prev: ProductActionState, fd: FormData) => Promise<ProductActionState>;
  brands: Option[];
  categories: Option[];
  defaults?: Defaults;
  submitLabel?: string;
}) {
  const [state, formAction] = useActionState(action, {});
  const formRef = useRef<HTMLFormElement>(null);

  // AI nəticəsini forma sahələrinə tətbiq et (uncontrolled inputs)
  const applyAi = (data: GeneratedListing) => {
    const f = formRef.current;
    if (!f) return;
    const set = (name: string, value: string) => {
      const el = f.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | null;
      if (el && value) el.value = value;
    };
    set("title", data.title);
    // Təsvir + satış mətni + açar sözləri birləşdir
    const descParts = [data.description, data.salesPitch && `\n\n${data.salesPitch}`].filter(Boolean);
    set("description", descParts.join(""));
    // Hashtag və açar sözləri partNumber-dən sonra qeyd kimi saxlamaq əvəzinə təsvirə əlavə etmirik;
    // istifadəçi onları AI panelindən kopyalaya bilər. Yalnız əsas sahələri doldururuq.
  };

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      {/* AI Elan Generatoru — mövcud UI token-ləri ilə */}
      <AiListingGenerator onApply={applyAi} initialName={defaults.title} />

      {state.error && <FormError message={state.error} />}
      {state.success && <div className="p-3 rounded-[var(--radius-sm)] bg-[rgba(52,211,153,.12)] border border-[rgba(52,211,153,.3)] text-[var(--success)] text-sm">Uğurla yadda saxlanıldı ✓</div>}

      <div>
        <Label>Şəkillər</Label>
        <ImageUploader existing={defaults.images ?? []} />
      </div>

      <div>
        <Label>Başlıq</Label>
        <Input name="title" defaultValue={defaults.title} placeholder="Məs: Ön əyləc disk dəsti" required />
        <FieldError errors={state.fieldErrors?.title} />
      </div>

      <div>
        <Label>Təsvir</Label>
        <textarea
          name="description"
          defaultValue={defaults.description}
          rows={4}
          placeholder="Hissənin təfərrüatları, uyğunluq, vəziyyət..."
          className="w-full bg-surface border border-[var(--border)] rounded-[var(--radius-sm)] px-4 py-3 text-sm text-content outline-none transition-colors placeholder:text-content-muted focus:border-[var(--border-glow)] resize-none"
          required
        />
        <FieldError errors={state.fieldErrors?.description} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label>Qiymət (₼)</Label>
          <Input name="price" type="number" step="0.01" defaultValue={defaults.price} placeholder="145" required />
          <FieldError errors={state.fieldErrors?.price} />
        </div>
        <div>
          <Label>Köhnə qiymət (₼) — istəyə bağlı</Label>
          <Input name="oldPrice" type="number" step="0.01" defaultValue={defaults.oldPrice ?? ""} placeholder="200" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label>Marka</Label>
          <select name="brandId" defaultValue={defaults.brandId ?? ""} required
            className="w-full bg-surface border border-[var(--border)] rounded-[var(--radius-sm)] px-4 py-3 text-sm text-content outline-none focus:border-[var(--border-glow)]">
            <option value="" disabled>Marka seçin</option>
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <FieldError errors={state.fieldErrors?.brandId} />
        </div>
        <div>
          <Label>Kateqoriya</Label>
          <select name="categoryId" defaultValue={defaults.categoryId ?? ""} required
            className="w-full bg-surface border border-[var(--border)] rounded-[var(--radius-sm)] px-4 py-3 text-sm text-content outline-none focus:border-[var(--border-glow)]">
            <option value="" disabled>Kateqoriya seçin</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <FieldError errors={state.fieldErrors?.categoryId} />
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <Label>Model</Label>
          <Input name="carModel" defaultValue={defaults.carModel ?? ""} placeholder="Tiggo 7" />
        </div>
        <div>
          <Label>Vəziyyət</Label>
          <select name="condition" defaultValue={defaults.condition ?? "ORIGINAL"}
            className="w-full bg-surface border border-[var(--border)] rounded-[var(--radius-sm)] px-4 py-3 text-sm text-content outline-none focus:border-[var(--border-glow)]">
            <option value="ORIGINAL">Orijinal</option>
            <option value="AFTERMARKET">Analoq</option>
            <option value="USED">İşlənmiş</option>
          </select>
        </div>
        <div>
          <Label>Stok sayı</Label>
          <Input name="stockCount" type="number" defaultValue={defaults.stockCount ?? 1} placeholder="1" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label>Hissə nömrəsi — istəyə bağlı</Label>
          <Input name="partNumber" defaultValue={defaults.partNumber ?? ""} placeholder="OEM: 12345-AB" />
        </div>
        <div>
          <Label>Status</Label>
          <select name="status" defaultValue={defaults.status ?? "ACTIVE"}
            className="w-full bg-surface border border-[var(--border)] rounded-[var(--radius-sm)] px-4 py-3 text-sm text-content outline-none focus:border-[var(--border-glow)]">
            <option value="ACTIVE">Aktiv</option>
            <option value="DRAFT">Qaralama</option>
            <option value="ARCHIVED">Arxiv</option>
          </select>
        </div>
      </div>

      <SubmitBtn label={submitLabel} />
    </form>
  );
}
