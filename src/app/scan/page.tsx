import { redirect } from "next/navigation";
import { DoorScanner } from "@/components/staff/DoorScanner";
import { getSession } from "@/lib/auth/session";
import { getStore } from "@/lib/data";
import { getDashboard } from "@/lib/data/admin";

export const dynamic = "force-dynamic";

export default async function ScanPage() {
  const session = await getSession();
  if (!session) redirect("/admin/connexion?next=/scan");
  const { event, stats } = await getDashboard(getStore());
  return (
    <DoorScanner
      eventId={event?.id}
      eventName={event?.name ?? "Événement"}
      staffName={session.name}
      isAdmin={session.role === "admin"}
      initialCheckedIn={stats.checkedIn}
      sold={stats.ticketsSold}
    />
  );
}
