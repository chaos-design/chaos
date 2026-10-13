import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"
import { readSupabasePublicConfig } from "./public-config"

export async function updateSession(request: NextRequest) {
  const config = readSupabasePublicConfig()
  let response = NextResponse.next({ request })

  const supabase = createServerClient(config.supabaseUrl, config.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value)
        }

        response = NextResponse.next({ request })
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options)
        }
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return {
    response,
    authenticated: Boolean(user),
  }
}
