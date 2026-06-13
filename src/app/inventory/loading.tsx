import { AdminListSkeleton } from "@/components/loading/AdminListSkeleton";

export default function InventoryLoading() {
  return <AdminListSkeleton narrow rows={6} navCount={5} />;
}
