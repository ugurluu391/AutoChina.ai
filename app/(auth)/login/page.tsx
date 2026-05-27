import Link from "next/link";
import { AuthShell } from "@/components/layout/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { GoogleButton } from "@/components/ui/google-button";
import { Divider } from "@/components/ui/divider";

export const metadata = { title: "Daxil ol" };

export default function LoginPage() {
  return (
    <AuthShell
      title="Xoş gəldin"
      subtitle="Hesabına daxil ol və hissə axtarmağa başla"
      footer={<>Hesabın yoxdur? <Link href="/register" className="text-accent hover:underline">Qeydiyyatdan keç</Link></>}
    >
      <GoogleButton label="Google ilə daxil ol" />
      <Divider text="və ya" />
      <LoginForm />
    </AuthShell>
  );
}
