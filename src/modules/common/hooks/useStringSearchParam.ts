import { useSearchParams } from '@solidjs/router'

export function useStringSearchParam(
  param: string,
  defaultValue: string | null = null,
) {
  const [searchParams, setSearchParams] = useSearchParams()

  const getParam = () => {
    const value = searchParams[param]
    return typeof value === 'string' ? value : defaultValue
  }

  const setParam = (value: string) => {
    setSearchParams({ [param]: value })
  }

  return [getParam, setParam] as const
}
