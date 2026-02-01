import { Navigate, useSearchParams } from '@solidjs/router'

export default function Map() {
  const [searchParams] = useSearchParams()

  const newSearchParams = new URLSearchParams({
    ...searchParams,
    fullscreen: 'true',
  })

  return <Navigate href={`/collection-points?${newSearchParams.toString()}`} />
}
