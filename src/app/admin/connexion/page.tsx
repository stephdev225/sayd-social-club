import Image from "next/image";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/staff/LoginForm";
import { getSession } from "@/lib/auth/session";

export default async function LoginPage({ searchParams }: PageProps<"/admin/connexion">) {
  const session = await getSession();
  const sp = await searchParams;
  const next = typeof sp.next === "string" && sp.next.startsWith("/") && !sp.next.startsWith("//") ? sp.next : "/admin";
  if (session) redirect(session.role === "staff" ? "/scan" : next);
  return (
    <main className="mx-auto flex min-h-svh max-w-sm flex-col justify-center px-4">
      <Image src="/brand/logo-block-ivory.png" alt="Sayd Social Club" width={560} height={590} className="mb-10 h-20 w-auto self-start" />
      <h1 className="t-h2 mb-8">Espace équipe</h1>
      <LoginForm next={next} />
    </main>
  );
}
