import { useEffect, useRef } from 'react';
import App from './App';

export default function DesignPreview() {
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const appRoot = previewRef.current?.querySelector('.app');
    appRoot?.setAttribute('inert', '');
    return () => appRoot?.removeAttribute('inert');
  }, []);

  return (
    <div className="design-preview-shell">
      <div ref={previewRef} className="design-preview-content">
        <App />
      </div>
      <div className="design-preview-note" role="note">
        VISUAL DESIGN PREVIEW · VIEW ONLY
      </div>
    </div>
  );
}
