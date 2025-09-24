export function Spinner({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-spin h-6 w-6 border-2 border-green-400 border-t-transparent rounded-full ${className}`} />
  )
}
