export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Server-side initialization can go here if needed
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./instrumentation-client')
  }
}
