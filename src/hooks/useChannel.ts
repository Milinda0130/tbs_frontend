import { useEffect } from 'react'
import echo from '@/lib/echo'

/**
 * useChannel — Subscribes to a Laravel Echo channel event.
 * Unsubscribes automatically on unmount.
 * Usage: useChannel('requests.5', 'RequestStatusUpdated', () => refetch())
 */
export function useChannel(
  channelName: string,
  eventName: string,
  callback: (data: unknown) => void
) {
  useEffect(() => {
    const channel = echo.channel(channelName)
    channel.listen(eventName, callback)

    return () => {
      channel.stopListening(eventName)
    }
  }, [channelName, eventName, callback])
}
