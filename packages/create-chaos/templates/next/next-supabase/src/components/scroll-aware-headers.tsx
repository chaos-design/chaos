"use client"

import { type ReactNode, useEffect, useState } from "react"

function useScrolledState() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    let animationFrameId = 0

    function updateScrollState() {
      animationFrameId = 0
      setIsScrolled(window.scrollY > 8)
    }

    function handleScroll() {
      if (animationFrameId === 0) {
        animationFrameId = window.requestAnimationFrame(updateScrollState)
      }
    }

    updateScrollState()
    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return isScrolled
}

export function ScaffoldNav({ children }: { children: ReactNode }) {
  const isScrolled = useScrolledState()

  return (
    <nav className="scaffold-nav" aria-label="主导航" data-scrolled={isScrolled}>
      {children}
    </nav>
  )
}

export function WorkspaceHeader({ children }: { children: ReactNode }) {
  const isScrolled = useScrolledState()

  return (
    <header className="workspace-header" data-scrolled={isScrolled}>
      {children}
    </header>
  )
}
