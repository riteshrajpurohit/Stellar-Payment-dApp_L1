import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ActivityItem } from "@/types/stellar";

interface ActivityCardProps {
  items: ActivityItem[];
}

const statusStyles: Record<ActivityItem["status"], string> = {
  pending: "border-amber-400/30 bg-amber-500/10 text-amber-100",
  success: "border-emerald-400/30 bg-emerald-500/10 text-emerald-100",
  error: "border-red-400/30 bg-red-500/10 text-red-100",
};

export const ActivityCard = ({ items }: ActivityCardProps) => {
  return (
    <Card className="border-white/10 bg-white/5 shadow-[0_20px_60px_rgba(2,6,23,0.45)] backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-lg text-white">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-md border border-dashed border-white/15 bg-black/20 p-4 text-sm text-slate-300">
            No transactions yet in this session.
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="rounded-md border border-white/10 bg-black/20 p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-white">{item.title}</p>
                  <p className="text-sm text-slate-300">{item.description}</p>
                  {item.hash ? (
                    <p className="mt-1 text-xs text-slate-400">{item.hash}</p>
                  ) : null}
                </div>
                <Badge className={statusStyles[item.status]}>
                  {item.status}
                </Badge>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
