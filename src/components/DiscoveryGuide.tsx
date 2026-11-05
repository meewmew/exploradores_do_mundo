import { asset } from '../services/contentRepository';

export function DiscoveryGuide({ image }: { image?: string }) {
  return <figure className="discovery-guide">
    <img src={asset(image || 'images/guia-qr.svg')} alt="Folha do continente: QR Code à esquerda e marcador de realidade aumentada à direita" />
    <figcaption><span><strong>QR Code</strong>Leia aqui no app para descobrir.</span><span><strong>Marcador</strong>Aponte a câmera para ver em 3D.</span></figcaption>
  </figure>;
}
