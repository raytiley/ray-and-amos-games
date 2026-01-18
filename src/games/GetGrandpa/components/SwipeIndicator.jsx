import './SwipeIndicator.css';

/**
 * Swipe/aim indicator showing trajectory preview
 * @param {number} startX - Starting X position (player position)
 * @param {number} startY - Starting Y position (player position)
 * @param {Object} aimStart - Where the swipe started
 * @param {Object} aimCurrent - Current swipe position
 */
export default function SwipeIndicator({ startX, startY, aimStart, aimCurrent }) {
  // Calculate the direction (opposite of drag)
  const dx = aimStart.x - aimCurrent.x;
  const dy = aimStart.y - aimCurrent.y;

  // Calculate power based on drag distance
  const distance = Math.sqrt(dx * dx + dy * dy);
  const power = Math.min(distance / 10, 20);
  const powerPercent = Math.min((power / 20) * 100, 100);

  // Calculate angle for the trajectory line
  const angle = Math.atan2(dy, dx);

  // Generate trajectory dots
  const dots = [];
  const gravity = 0.3;
  const vx = Math.cos(angle) * power;
  const vy = Math.sin(angle) * power;

  for (let t = 0; t < 30; t += 3) {
    const x = startX + vx * t;
    const y = startY + vy * t + 0.5 * gravity * t * t;

    // Only show dots in valid game area
    if (y < 0 || y > 600 || x < 0 || x > 800) break;

    dots.push({
      x: (x / 800) * 100,
      y: (y / 600) * 100,
      opacity: 1 - (t / 30) * 0.7,
      size: 8 - (t / 30) * 4
    });
  }

  // Power indicator color
  const getPowerColor = () => {
    if (powerPercent < 33) return '#4ade80'; // Green - low power
    if (powerPercent < 66) return '#fbbf24'; // Yellow - medium power
    return '#ef4444'; // Red - high power
  };

  return (
    <div className="swipe-indicator">
      {/* Trajectory dots */}
      {dots.map((dot, i) => (
        <div
          key={i}
          className="trajectory-dot"
          style={{
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            opacity: dot.opacity,
            width: `${dot.size}px`,
            height: `${dot.size}px`,
          }}
        />
      ))}

      {/* Power meter */}
      <div className="power-meter" style={{ left: `${(startX / 800) * 100}%`, top: '85%' }}>
        <div className="power-bar-bg">
          <div
            className="power-bar-fill"
            style={{
              width: `${powerPercent}%`,
              backgroundColor: getPowerColor()
            }}
          />
        </div>
        <span className="power-label">Power</span>
      </div>

      {/* Drag indicator line */}
      <svg className="drag-line" viewBox="0 0 800 600" preserveAspectRatio="none">
        <line
          x1={aimStart.x}
          y1={aimStart.y}
          x2={aimCurrent.x}
          y2={aimCurrent.y}
          stroke="rgba(255, 255, 255, 0.5)"
          strokeWidth="3"
          strokeDasharray="10,5"
        />
        <circle
          cx={aimCurrent.x}
          cy={aimCurrent.y}
          r="12"
          fill="rgba(255, 255, 255, 0.3)"
          stroke="white"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}
