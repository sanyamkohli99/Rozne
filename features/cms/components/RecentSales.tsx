import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { RecentOrder } from "@/_actions/dashboard";

interface RecentSalesProps {
  orders: RecentOrder[];
}

export function RecentSales({ orders }: RecentSalesProps) {
  if (orders.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No orders yet.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {orders.map((order, i) => (
        <div key={i} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{order.initials}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {order.name ?? "Guest"}
            </p>
            <p className="text-sm text-muted-foreground">
              {order.email ?? "—"}
            </p>
          </div>
          <div className="ml-auto font-medium">+₹{order.amount}</div>
        </div>
      ))}
    </div>
  );
}
