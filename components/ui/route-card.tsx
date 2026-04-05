import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type RouteCardProps = {
  href: string;
  title: string;
  description: string;
  icon?: LucideIcon;
};

export function RouteCard({ href, title, description, icon: Icon }: RouteCardProps) {
  return (
    <Link href={href} className="route-card">
      {Icon && (
        <div className="route-card-icon">
          <Icon size={15} />
        </div>
      )}
      <h4>{title}</h4>
      <p>{description}</p>
    </Link>
  );
}
