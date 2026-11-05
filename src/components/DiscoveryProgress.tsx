import { useApp } from '../hooks/useApp';

export function DiscoveryProgress() {
  const { unlocked } = useApp();
  const percentage = Math.round(unlocked.length / 6 * 100);
  return <section className="adventure-progress" aria-label="Seu progresso de exploração">
    <div className="adventure-progress-label"><span>Continentes descobertos: <strong>{unlocked.length} de 6</strong></span><strong>{percentage}%</strong></div>
    <progress max="6" value={unlocked.length} aria-label={`Continentes descobertos: ${unlocked.length} de 6, ${percentage}%`} />
  </section>;
}
