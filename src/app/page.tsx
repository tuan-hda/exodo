import Dashboard from '../features/dashboard/Dashboard'
import { AuthGate } from '../features/auth/AuthGate'

export default function Page() {
  return (
    <AuthGate>
      <Dashboard />
    </AuthGate>
  )
}
