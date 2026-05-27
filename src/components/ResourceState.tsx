type ResourceStateProps = {
  error?: string | null
  isEmpty?: boolean
  isLoading: boolean
  emptyMessage: string
}

export function ResourceState({
  emptyMessage,
  error,
  isEmpty,
  isLoading,
}: ResourceStateProps) {
  if (isLoading) {
    return <div className="state-box">Loading data...</div>
  }

  if (error) {
    return <div className="state-box error">{error}</div>
  }

  if (isEmpty) {
    return <div className="state-box">{emptyMessage}</div>
  }

  return null
}
