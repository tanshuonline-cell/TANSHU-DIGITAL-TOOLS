import App from './App';

export default function DesignPreview() {
  return (
    <div className="design-preview-shell">
      <App />
      <div className="design-preview-note" role="note">
        VISUAL DESIGN PREVIEW · VIEW ONLY
      </div>
    </div>
  );
}
