'use client'

import { useRef, useCallback } from 'react'
import Link from 'next/link'
import { useIntelligentPrefetch } from '@/lib/hooks/usePreload'

interface PreloadLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
  prefetchOnHover?: boolean
  prefetchOnViewport?: boolean
  [key: string]: any
}

export function PreloadLink({
  href,
  children,
  className,
  onClick,
  prefetchOnHover = true,
  prefetchOnViewport = false,
  ...props
}: PreloadLinkProps) {
  const linkRef = useRef<HTMLAnchorElement>(null)
  const { prefetchOnHover: handleHover, prefetchOnViewport: handleViewport } = useIntelligentPrefetch()

  const handleMouseEnter = useCallback(() => {
    if (prefetchOnHover) {
      handleHover(href)
    }
  }, [href, handleHover, prefetchOnHover])

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick()
    }
  }, [onClick])

  // Set up viewport prefetch if enabled
  if (prefetchOnViewport && linkRef.current) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            handleViewport(href)
            observer.disconnect()
          }
        })
      },
      { threshold: 0.5 }
    )

    observer.observe(linkRef.current)
  }

  return (
    <Link
      ref={linkRef}
      href={href}
      className={className}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  )
}

// Specialized link components for common routes
export function DashboardLink({ children, ...props }: Omit<PreloadLinkProps, 'href'>) {
  return (
    <PreloadLink href="/dashboard" prefetchOnHover {...props}>
      {children}
    </PreloadLink>
  )
}

export function CampaignsLink({ children, ...props }: Omit<PreloadLinkProps, 'href'>) {
  return (
    <PreloadLink href="/campaigns" prefetchOnHover {...props}>
      {children}
    </PreloadLink>
  )
}

export function GroupsLink({ children, ...props }: Omit<PreloadLinkProps, 'href'>) {
  return (
    <PreloadLink href="/groups" prefetchOnHover {...props}>
      {children}
    </PreloadLink>
  )
}

export function MembersLink({ children, ...props }: Omit<PreloadLinkProps, 'href'>) {
  return (
    <PreloadLink href="/members" prefetchOnHover {...props}>
      {children}
    </PreloadLink>
  )
}

export function SessionsLink({ children, ...props }: Omit<PreloadLinkProps, 'href'>) {
  return (
    <PreloadLink href="/sessions" prefetchOnHover {...props}>
      {children}
    </PreloadLink>
  )
}

export function TeamLink({ children, ...props }: Omit<PreloadLinkProps, 'href'>) {
  return (
    <PreloadLink href="/team" prefetchOnHover {...props}>
      {children}
    </PreloadLink>
  )
}