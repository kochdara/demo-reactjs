import { useCallback, useEffect, useState } from 'react'

type ResourceResult<T> = {
  data: T | null
  error: string | null
  isLoading: boolean
  reload: () => Promise<void>
}

export function useResource<T>(loader: () => Promise<T>): ResourceResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadData = useCallback(async (isActive: () => boolean = () => true) => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await loader()

      if (isActive()) {
        setData(result)
      }
    } catch (caughtError) {
      if (isActive()) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Unable to load data from the API',
        )
      }
    } finally {
      if (isActive()) {
        setIsLoading(false)
      }
    }
  }, [loader])

  useEffect(() => {
    let isActive = true

    void Promise.resolve().then(() => loadData(() => isActive))

    return () => {
      isActive = false
    }
  }, [loadData])

  return { data, error, isLoading, reload: () => loadData() }
}
