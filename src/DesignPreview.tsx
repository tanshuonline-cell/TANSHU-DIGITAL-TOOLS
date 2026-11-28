import App from './App';

export default function DesignPreview() {
  const blockPreviewAction = (event: React.SyntheticEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div
      className="design-preview-shell"
      onClickCapture={blockPreviewAction}
      onSubmitCapture={blockPreviewAction}
      onKeyDownCapture={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          blockPreviewAction(event);
        }
      }}
    >
      <div className="design-preview-content">
        <App />
      </div>
      <div className="design-preview-note" role="note">
        VISUAL DESIGN PREVIEW · HOVER TO SEE THE NAVY EFFECT
      </div>
    </div>
  );
}
