export function JourneyLoading({ progress = false }: { progress?: boolean }) {
  return <main className="adventure-loading" role="status" aria-live="polite">
    <span className="adventure-loading-dots" aria-hidden="true">{Array.from({ length: 8 }, (_, i) => <i key={i} style={{ transform: `rotate(${i * 45}deg) translateY(-2rem)`, animationDelay: `${i * -.1}s` }} />)}</span>
    <p>{progress ? 'Carregando suas descobertas…' : 'Carregando a aventura…'}</p>
  </main>;
}
