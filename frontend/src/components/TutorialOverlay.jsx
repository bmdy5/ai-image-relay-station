import React from 'react';
import ReactDOM from 'react-dom';
import { X, ChevronRight, SkipForward } from 'lucide-react';
import './TutorialOverlay.css';

const TutorialOverlay = ({ rect, content, onNext, onSkip, isLastStep }) => {
  if (!rect) return null;

  const tooltipStyle = {
    top: rect.bottom + 12,
    left: Math.max(12, Math.min(window.innerWidth - 312, rect.left + rect.width / 2 - 150)),
  };

  // If the tooltip would go off the bottom of the screen, show it above the highlight
  if (tooltipStyle.top + 200 > window.innerHeight) {
    tooltipStyle.top = rect.top - 12 - 150; // Approximate height
  }

  return ReactDOM.createPortal(
    <div className="tutorial-container">
      <div className="tutorial-mask">
        <div 
          className="tutorial-highlight"
          style={{
            top: rect.top - 4,
            left: rect.left - 4,
            width: rect.width + 8,
            height: rect.height + 8,
          }}
        />
      </div>
      <div className="tutorial-tooltip" style={tooltipStyle}>
        <div className="tutorial-tooltip-content">
          <p>{content}</p>
        </div>
        <div className="tutorial-tooltip-actions">
          {!isLastStep && (
            <button className="tutorial-btn-skip" onClick={onSkip}>
              <SkipForward size={14} /> 跳过
            </button>
          )}
          <button className="tutorial-btn-next" onClick={onNext}>
            {isLastStep ? '知道了' : '下一步'} <ChevronRight size={14} />
          </button>
        </div>
        <button className="tutorial-close" onClick={onSkip}>
          <X size={16} />
        </button>
      </div>
    </div>,
    document.body
  );
};

export default TutorialOverlay;
