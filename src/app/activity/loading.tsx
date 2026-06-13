import { AdminListSkeleton } from "@/components/loading/AdminListSkeleton";

export default function ActivityLoading() {
  return <AdminListSkeleton narrow rows={8} navCount={5} />;
}
