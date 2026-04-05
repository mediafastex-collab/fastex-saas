import Link from "next/link";

type ActionLinkProps = {
  href: string;
  label: string;
  secondary?: boolean;
};

export function ActionLink({ href, label, secondary = false }: ActionLinkProps) {
  return (
    <Link href={href} className={`button${secondary ? " secondary" : ""}`}>
      {label}
    </Link>
  );
}
