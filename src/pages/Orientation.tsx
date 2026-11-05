import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useJourney } from '../hooks/useJourney';
import { GuideScene } from '../components/GuideScene';
import { ListenButton } from '../components/ListenButton';
import Collection from './Collection';

const steps = [
  { kind: 'map', title: 'Escolha um continente', text: 'Toque no lugar que quer conhecer no mapa.' },
  { kind: 'sheet', title: 'Leia o QR Code', text: 'Encontre o QR na folha. Leia aqui no app para descobrir o continente.' },
  { kind: 'ar', title: 'Veja em realidade aumentada', text: 'Aponte para o quadrado preto da folha. Depois de descobrir, estude sem câmera.' },
] as const;
const instructions = `Instruções. Pegue a folha da turma. ${steps.map(step => `${step.title}. ${step.text}`).join(' ')}`;

export default function Orientation() {
  const journey = useJourney(), navigate = useNavigate(), dialog = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState(0);
  const finish = () => { journey.finishInstructions(); navigate('/mapa'); };
  const camera = () => { journey.finishInstructions(); navigate(journey.pending ? `/qr/${journey.pending}` : '/mapa', { state: { chooseQr: true } }); };
  useEffect(() => {
    const modal = dialog.current;
    if (!modal) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    modal.showModal();
    return () => { modal.close(); document.body.style.overflow = overflow; };
  }, []);
  return <>
    <Collection />
    <dialog ref={dialog} className="instructions-dialog" aria-labelledby="instructions-title" onCancel={event => { event.preventDefault(); finish(); }}>
      <header className="instructions-dialog-heading"><h2 id="instructions-title">Instruções</h2><button className="button secondary" aria-label="Fechar instruções e explorar" onClick={finish}>×</button></header>
      <div className="instructions-dialog-body">
        <div className="instructions-dialog-intro"><p>Pegue a folha da turma e vamos explorar!</p><ListenButton text={instructions} /></div>
        <section className="instruction-step" aria-live="polite" aria-atomic="true">
          <p className="instruction-count">Passo {step + 1} de {steps.length}</p>
          <GuideScene kind={steps[step].kind} />
          <h3>{steps[step].title}</h3><p>{steps[step].text}</p>
        </section>
        <div className="instruction-step-nav" role="group" aria-label="Passos das instruções">
          <button className="button secondary" disabled={step === 0} onClick={() => setStep(value => value - 1)}>Anterior</button>
          <button className="button secondary" disabled={step === steps.length - 1} onClick={() => setStep(value => value + 1)}>Próximo</button>
        </div>
      </div>
      <footer className="instructions-dialog-footer"><div><button className="button primary" onClick={finish}>Vamos explorar</button><button className="button secondary" onClick={camera}>Ler QR Code</button></div><Link className="back-link" to="/">← Trocar perfil</Link></footer>
    </dialog>
  </>;
}
