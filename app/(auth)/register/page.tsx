import Link from "next/link";
import { AuthShell } from "@/components/layout/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";
import { GoogleButton } from "@/components/ui/google-button";
import { Divider } from "@/components/ui/divider";

export const metadata = { title: "Qeydiyyat" };

export default function RegisterPage() {
  return (
    <AuthShell
      title="Hesab yarat"
      subtitle="Pulsuz qeydiyyatdan keç və AI köməkçini sına"
      footer={<>Artıq hesabın var? <Link href="/login" className="text-accent hover:underline">Daxil ol</Link></>}
    >
      <GoogleButton label="Google ilə qeydiyyat" />
      <Divider text="və ya" />
      <RegisterForm />
    </AuthShell>
  );
}
