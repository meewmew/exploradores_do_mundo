import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { safePreference } from '../services/preferences';
import type { ContinentId } from '../types/continent';
import { sheetOffset, shouldOpenCountries, settleSheet } from '../services/sheetMotion';

type Drag = { pointer: number; startX: number; startY: number; origin: number; threshold: number; moved: boolean; samples: { y: number; time: number }[] };

export function useCountryShortcut(id?: ContinentId) {
  const navigate = useNavigate();
  const sheetRef = useRef<HTMLElement>(null);
  const drag = useRef<Drag | null>(null);
  const motion = useRef({ position: 0, velocity: 0, frame: 0 });
  const [showHint, setShowHint] = useState(() => !safePreference('exploradores:paises-hint:v1'));
  const dismissHint = () => {
    safePreference('exploradores:paises-hint:v1', '1');
    setShowHint(false);
  };
  const stop = () => cancelAnimationFrame(motion.current.frame);
  const paint = () => {
    const sheet = sheetRef.current;
    if (sheet) sheet.style.transform = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? '' : `translateY(${motion.current.position}px)`;
  };
  const settle = () => {
    stop();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      motion.current.position = 0;
      motion.current.velocity = 0;
      paint();
      return;
    }
    let previous = performance.now();
    const frame = (now: number) => {
      const state = motion.current;
      const dt = Math.min((now - previous) / 1000, 1 / 30);
      previous = now;
      Object.assign(state, settleSheet(state.position, state.velocity, dt));
      if (Math.abs(state.position) < .1 && Math.abs(state.velocity) < 1) {
        state.position = 0;
        state.velocity = 0;
        paint();
        return;
      }
      paint();
      state.frame = requestAnimationFrame(frame);
    };
    motion.current.frame = requestAnimationFrame(frame);
  };
  const release = (event: PointerEvent<HTMLElement>, cancelled: boolean) => {
    const current = drag.current;
    if (!current || current.pointer !== event.pointerId) return;
    drag.current = null;
    sheetRef.current?.removeAttribute('data-dragging');
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    const last = current.samples.at(-1);
    if (last && event.timeStamp - last.time > 80) motion.current.velocity = 0;
    const state = motion.current;
    if (!cancelled && current.moved && id && id !== 'antartida' && shouldOpenCountries(state.position, state.velocity)) {
      dismissHint();
      navigate(`/paises/${id}`);
    } else settle();
  };

  useEffect(() => () => cancelAnimationFrame(motion.current.frame), []);
  useEffect(() => {
    stop();
    drag.current = null;
    motion.current.position = 0;
    motion.current.velocity = 0;
    sheetRef.current?.removeAttribute('data-dragging');
    if (sheetRef.current) sheetRef.current.style.transform = '';
  }, [id]);

  return {
    sheetRef, showHint, dismissHint,
    onPointerDown(event: PointerEvent<HTMLElement>) {
      if (!event.isPrimary || event.button !== 0 || drag.current || !id || id === 'antartida') return;
      stop();
      drag.current = { pointer: event.pointerId, startX: event.clientX, startY: event.clientY, origin: motion.current.position, threshold: 0, moved: false, samples: [{ y: motion.current.position, time: event.timeStamp }] };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    onPointerMove(event: PointerEvent<HTMLElement>) {
      const current = drag.current;
      if (!current || current.pointer !== event.pointerId) return;
      const distance = event.clientY - current.startY;
      if (!current.moved && Math.abs(event.clientX - current.startX) > Math.max(10, Math.abs(distance))) {
        release(event, true);
        return;
      }
      if (!current.moved && Math.abs(distance) < 10) return;
      if (!current.moved) current.threshold = Math.sign(distance) * 10;
      current.moved = true;
      const position = sheetOffset(current.origin + distance - current.threshold);
      current.samples.push({ y: position, time: event.timeStamp });
      current.samples = current.samples.filter(sample => event.timeStamp - sample.time <= 80);
      const first = current.samples[0];
      const elapsed = event.timeStamp - first.time;
      motion.current.velocity = elapsed > 0 ? (position - first.y) / elapsed * 1000 : 0;
      motion.current.position = position;
      sheetRef.current?.setAttribute('data-dragging', 'true');
      paint();
    },
    onPointerUp(event: PointerEvent<HTMLElement>) { release(event, false); },
    onPointerCancel(event: PointerEvent<HTMLElement>) { release(event, true); },
    onLostPointerCapture(event: PointerEvent<HTMLElement>) { release(event, true); },
  };
}
