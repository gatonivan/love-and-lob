import { useEffect, useState } from 'react'

/**
 * Keeps a component mounted for `delay` ms after `active` becomes false,
 * allowing exit transitions to play before unmounting.
 * Returns [shouldRender, isVisible] — render while shouldRender is true,
 * apply visible styles only when isVisible is true.
 */
export function useDeferredUnmount(active: boolean, delay = 300): [boolean, boolean] {
  const [shouldRender, setShouldRender] = useState(active)

  useEffect(() => {
    if (active) {
      setShouldRender(true)
    } else {
      const timer = setTimeout(() => setShouldRender(false), delay)
      return () => clearTimeout(timer)
    }
  }, [active, delay])

  return [shouldRender, active]
}
