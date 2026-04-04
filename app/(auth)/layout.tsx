// Auth group layout — renders children directly with no App Shell.
// The login (and any future auth) pages are completely isolated from
// the main application navigation structure.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
