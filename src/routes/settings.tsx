import { SettingsPage } from '@/components/SettingsPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/settings')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SettingsPage />
}
