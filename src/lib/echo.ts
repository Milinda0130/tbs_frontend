// Placeholder until the real Laravel Echo instance is available.
// Replace this with the real implementation when it lands.

const echo = {
  channel: (_name: string) => ({
    listen: (_event: string, _cb: unknown) => {},
    stopListening: (_event: string) => {},
  }),
}

export default echo
