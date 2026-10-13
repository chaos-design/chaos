import { createClient } from "../../lib/supabase/server"

export interface AuthUser {
  id: string
  email: string
}

export async function getOptionalAuthUser(): Promise<AuthUser | null> {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user?.email) {
    return null
  }

  return {
    id: user.id,
    email: user.email,
  }
}
