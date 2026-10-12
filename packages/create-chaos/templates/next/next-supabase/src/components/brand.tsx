import Link from "next/link"

export function Brand() {
  return (
    <Link className="brand-mark" href="/" aria-label="next-supabase-scaffold 首页">
      <span aria-hidden="true">N/S</span>
      <span>next-supabase-scaffold</span>
    </Link>
  )
}
