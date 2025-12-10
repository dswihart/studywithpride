"use client"

import { useState, useCallback, useRef, useEffect } from "react"

interface UseFetchOptions {
  /** Whether to fetch immediately on mount */
  immediate?: boolean
  /** Initial data value */
  initialData?: any
}

interface UseFetchReturn<T> {
  data: T | null
  loading: boolean
  error: string | null
  fetch: () => Promise<T | null>
  setData: (data: T | null) => void
  reset: () => void
}

/**
 * Generic fetch hook with loading/error states
 * @param url - API endpoint URL
 * @param options - Fetch options
 * @returns Object with data, loading, error states and fetch function
 */
export function useFetch<T = any>(
  url: string,
  options: UseFetchOptions = {}
): UseFetchReturn<T> {
  const { immediate = true, initialData = null } = options

  const [data, setData] = useState<T | null>(initialData)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState<string | null>(null)

  // Track mounted state to prevent state updates after unmount
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const fetchData = useCallback(async (): Promise<T | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(url, { credentials: "include" })
      const result = await response.json()

      if (!mountedRef.current) return null

      if (result.success) {
        const fetchedData = result.data as T
        setData(fetchedData)
        return fetchedData
      } else {
        setError(result.error || "Request failed")
        return null
      }
    } catch (err) {
      if (!mountedRef.current) return null
      const message = err instanceof Error ? err.message : "Request failed"
      setError(message)
      return null
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [url])

  const reset = useCallback(() => {
    setData(initialData)
    setError(null)
    setLoading(false)
  }, [initialData])

  // Fetch on mount if immediate is true
  useEffect(() => {
    if (immediate) {
      fetchData()
    }
  }, [immediate, fetchData])

  return {
    data,
    loading,
    error,
    fetch: fetchData,
    setData,
    reset,
  }
}

interface UseMutationOptions {
  method?: "POST" | "PUT" | "PATCH" | "DELETE"
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
}

interface UseMutationReturn<T, P = any> {
  data: T | null
  loading: boolean
  error: string | null
  mutate: (payload?: P) => Promise<T | null>
  reset: () => void
}

/**
 * Hook for mutations (POST, PUT, DELETE)
 * @param url - API endpoint URL
 * @param options - Mutation options
 * @returns Object with mutate function and states
 */
export function useMutation<T = any, P = any>(
  url: string,
  options: UseMutationOptions = {}
): UseMutationReturn<T, P> {
  const { method = "POST", onSuccess, onError } = options

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const mutate = useCallback(
    async (payload?: P): Promise<T | null> => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: payload ? JSON.stringify(payload) : undefined,
        })
        const result = await response.json()

        if (!mountedRef.current) return null

        if (result.success) {
          const responseData = result.data as T
          setData(responseData)
          onSuccess?.(responseData)
          return responseData
        } else {
          const errorMsg = result.error || "Request failed"
          setError(errorMsg)
          onError?.(errorMsg)
          return null
        }
      } catch (err) {
        if (!mountedRef.current) return null
        const message = err instanceof Error ? err.message : "Request failed"
        setError(message)
        onError?.(message)
        return null
      } finally {
        if (mountedRef.current) {
          setLoading(false)
        }
      }
    },
    [url, method, onSuccess, onError]
  )

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return {
    data,
    loading,
    error,
    mutate,
    reset,
  }
}
