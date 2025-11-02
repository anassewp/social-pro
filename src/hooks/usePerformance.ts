'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

// Debounce Hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Throttle Hook
export function useThrottle<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value)
  const lastExecutedRef = useRef<number>(Date.now())

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastExecutedRef.current >= delay) {
        setThrottledValue(value)
        lastExecutedRef.current = Date.now()
      }
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return throttledValue
}

// Local Storage Hook
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`خطأ في قراءة ${key} من localStorage:`, error)
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.warn(`خطأ في حفظ ${key} في localStorage:`, error)
    }
  }, [key, storedValue])

  return [storedValue, setValue] as const
}

// Intersection Observer Hook
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [target, setTarget] = useState<Element | null>(null)

  useEffect(() => {
    if (!target) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
      },
      {
        threshold: 0.1,
        ...options,
      }
    )

    observer.observe(target)

    return () => {
      observer.unobserve(target)
    }
  }, [target, options])

  return { isIntersecting, setTarget }
}

// Previous Value Hook
export function usePrevious<T>(value: T): T | undefined {
  const [previous, setPrevious] = useState<T>()
  const previousRef = useRef<T>()

  useEffect(() => {
    setPrevious(previousRef.current)
    previousRef.current = value
  }, [value])

  return previous
}

// Event Listener Hook
export function useEventListener<K extends keyof GlobalEventHandlersEventMap>(
  element: Element | null,
  event: K,
  handler: (event: GlobalEventHandlersEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions
) {
  useEffect(() => {
    if (!element) return

    const eventListener = (event: GlobalEventHandlersEventMap[K]) => {
      handler(event)
    }

    element.addEventListener(event as string, eventListener, options)

    return () => {
      element.removeEventListener(event as string, eventListener, options)
    }
  }, [element, event, handler, options])
}