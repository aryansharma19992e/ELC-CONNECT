"use client"

import { useEffect, useState, useCallback } from 'react'

interface ClientWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ClientWrapper({ children, fallback = null }: ClientWrapperProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// Hook for safely accessing localStorage
export function useLocalStorage() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const getItem = useCallback((key: string): string | null => {
    if (!isClient) return null
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  }, [isClient])

  const setItem = useCallback((key: string, value: string): void => {
    if (!isClient) return
    try {
      localStorage.setItem(key, value)
    } catch {
      // Ignore errors
    }
  }, [isClient])

  const removeItem = useCallback((key: string): void => {
    if (!isClient) return
    try {
      localStorage.removeItem(key)
    } catch {
      // Ignore errors
    }
  }, [isClient])

  const clear = useCallback((): void => {
    if (!isClient) return
    try {
      localStorage.clear()
    } catch {
      // Ignore errors
    }
  }, [isClient])

  return {
    isClient,
    getItem,
    setItem,
    removeItem,
    clear
  }
}
