import { AdminShell } from "@/components/admin/AdminNav";
import { StaffManager } from "@/components/admin/StaffManager";
import * as repo from "@/lib/db/repo";
import { getPlanLimits } from "@/lib/plans";
import { requireMerchantAdmin } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function StaffPage() {
  const { business } = await requireMerchantAdmin();
  const limits = getPlanLimits(business.plan);
  const [staff, activeCount] = await Promise.all([
    repo.listStaff(business.id),
    repo.countStaff(business.id),
  ]);

  return (
    <AdminShell title="Staff" businessName={business.name} role="admin">
      <StaffManager staff={staff} maxStaff={limits.maxStaff} activeCount={activeCount} />
    </AdminShell>
  );
}
