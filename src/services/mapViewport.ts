export interface MapView { scale: number; x: number; y: number }
export interface MapSize { width: number; height: number }
export interface MapPointer { id: number; x: number; y: number }
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function constrainMap(view: MapView, size: MapSize): MapView {
  const scale = clamp(view.scale, 1, 5);
  const width = Math.min(size.width, size.height * 1000 / 510), height = width * 510 / 1000;
  const maxX = Math.max(0, (width * scale - size.width) / 2);
  const maxY = Math.max(0, (height * scale - size.height) / 2);
  return { scale, x: clamp(view.x, -maxX, maxX), y: clamp(view.y, -maxY, maxY) };
}

export function zoomMap(view: MapView, scale: number, size: MapSize, focal = { x: 0, y: 0 }): MapView {
  const ratio = clamp(scale, 1, 5) / view.scale;
  return constrainMap({ scale: view.scale * ratio, x: focal.x - (focal.x - view.x) * ratio, y: focal.y - (focal.y - view.y) * ratio }, size);
}

export function moveMap(view: MapView, previous: MapPointer[], next: MapPointer[], size: MapSize): MapView {
  if (!next.length || previous.length !== next.length || next.length > 2) return view;
  const before = next.map(point => previous.find(item => item.id === point.id));
  if (before.some(point => !point)) return view;
  if (next.length === 1) return constrainMap({ ...view, x: view.x + next[0].x - before[0]!.x, y: view.y + next[0].y - before[0]!.y }, size);
  const a = before[0]!, b = before[1]!;
  const oldDistance = Math.hypot(a.x - b.x, a.y - b.y);
  if (oldDistance < 1) return view;
  const center = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  const zoomed = zoomMap(view, view.scale * Math.hypot(next[0].x - next[1].x, next[0].y - next[1].y) / oldDistance, size, center);
  return constrainMap({ ...zoomed, x: zoomed.x + (next[0].x + next[1].x) / 2 - center.x, y: zoomed.y + (next[0].y + next[1].y) / 2 - center.y }, size);
}
