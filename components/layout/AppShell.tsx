import NavBar from './NavBar'

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen metal-grid bg-[var(--color-bg-deep)]">
      <NavBar />
      <main className="pt-16 min-h-screen">
        {children}
      </main>
    </div>
  )
}
