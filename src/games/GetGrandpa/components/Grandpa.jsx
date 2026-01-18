import './Grandpa.css';
import grandpaFace from '../artwork/grandpa_face.jpg';

/**
 * Grandpa character component
 * @param {number} x - X position in game coordinates
 * @param {number} y - Y position in game coordinates
 * @param {string} state - Current AI state: 'hiding', 'peeking', 'running', 'throwing', 'hit', 'fleeing'
 * @param {number} tiredness - How tired grandpa is (0-5), affects movement speed
 */
export default function Grandpa({ x, y, state, tiredness = 0 }) {
  // Convert game coordinates to percentages
  const left = (x / 800) * 100;
  const top = (y / 600) * 100;

  // Calculate transition duration based on state and tiredness
  // Fleeing starts fast (0.4s) but slows with tiredness
  // Running is slower and also affected by tiredness
  const getTransitionDuration = () => {
    if (state === 'fleeing') {
      return 0.4 + (tiredness * 0.3); // 0.4s to 1.9s
    }
    if (state === 'running') {
      return 1.2 + (tiredness * 0.4); // 1.2s to 3.2s
    }
    return 1.8; // Default for other states
  };

  const transitionDuration = getTransitionDuration();

  return (
    <div
      className={`grandpa grandpa-${state}`}
      style={{
        left: `${left}%`,
        top: `${top}%`,
        transitionDuration: `${transitionDuration}s, ${transitionDuration}s, 0.3s, 0.3s`,
      }}
    >
      <div className="grandpa-body">
        {/* Head with real grandpa face */}
        <div className="grandpa-head">
          <img
            src={grandpaFace}
            alt="Grandpa"
            className={`grandpa-face-img ${state === 'hit' ? 'hit' : ''}`}
          />
          {state === 'hit' && <div className="hit-overlay">X_X</div>}
        </div>

        {/* Body */}
        <div className="grandpa-torso" />

        {/* Arms */}
        <div className={`grandpa-arm grandpa-arm-left ${state === 'throwing' ? 'throwing' : ''}`} />
        <div className={`grandpa-arm grandpa-arm-right ${state === 'throwing' ? 'throwing' : ''}`} />

        {/* Legs */}
        <div className="grandpa-legs">
          <div className={`grandpa-leg ${state === 'running' ? 'running' : ''}`} />
          <div className={`grandpa-leg ${state === 'running' ? 'running' : ''}`} />
        </div>
      </div>

      {/* State indicator */}
      {state === 'hit' && <div className="hit-effect">SPLAT!</div>}
    </div>
  );
}
