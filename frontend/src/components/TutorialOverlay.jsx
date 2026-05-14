import { useMemo } from 'react';
import ReactDOM from 'react-dom';
import { X, ChevronRight, Sparkles } from 'lucide-react';
import './TutorialOverlay.css';

const TutorialOverlay = ({ rect, content, onNext, onSkip, isLastStep, currentStep, totalSteps }) => {
  const tooltipPosition = useMemo(() => {
    if (!rect) return { top: 0, left: 0, arrowClass: 'arrow-top' };
    
    const margin = 16;
    const tooltipWidth = 320;
    const tooltipHeight = 180; // Estimated
    
    let top = rect.bottom + margin;
    let left = rect.left + rect.width / 2 - tooltipWidth / 2;
    let arrowClass = 'arrow-top';

    // Check if tooltip goes off screen (bottom)
    if (top + tooltipHeight > window.innerHeight) {
      top = rect.top - tooltipHeight - margin;
      arrowClass = 'arrow-bottom';
    }

    // Check if tooltip goes off screen (left/right)
    if (left < margin) {
      left = margin;
    } else if (left + tooltipWidth > window.innerWidth - margin) {
      left = window.innerWidth - tooltipWidth - margin;
    }

    return { top, left, arrowClass };
  }, [rect]);

  if (!rect) return null;

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
        >
          <div className="highlight-glow" />
        </div>
      </div>
      <div 
        className={`tutorial-tooltip ${tooltipPosition.arrowClass}`} 
        style={{ top: tooltipPosition.top, left: tooltipPosition.left }}
      >
        <div className="tutorial-header">
          <span className="step-indicator">
            <Sparkles size={14} className="sparkle-icon" />
            步骤 {currentStep + 1} / {totalSteps}
          </span>
          <button className="tutorial-close" onClick={onSkip}>
            <X size={16} />
          </button>
        </div>
        <div className="tutorial-tooltip-content">
          <p>{content}</p>
        </div>
        <div className="tutorial-tooltip-actions">
          {!isLastStep && (
            <button className="tutorial-btn-skip" onClick={onSkip}>
              跳过
            </button>
          )}
          <button className="tutorial-btn-next" onClick={onNext}>
            {isLastStep ? '开启旅程' : '下一步'} 
            {!isLastStep && <ChevronRight size={14} />}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TutorialOverlay;
