import './Snowball.css';

/**
 * Snowball component
 * @param {number} x - X position in game coordinates
 * @param {number} y - Y position in game coordinates
 * @param {number} scale - Scale factor (for enemy snowballs growing)
 * @param {boolean} isEnemy - Whether this is an enemy snowball
 */
export default function Snowball({ x, y, scale = 1, isEnemy = false }) {
  // Convert game coordinates to percentages
  const left = (x / 800) * 100;
  const top = (y / 600) * 100;

  return (
    <div
      className={`snowball ${isEnemy ? 'enemy' : 'player'}`}
      style={{
        left: `${left}%`,
        top: `${top}%`,
        transform: `translate(-50%, -50%) scale(${scale})`,
      }}
    >
      <div className="snowball-inner" />
      <div className="snowball-shine" />
    </div>
  );
}
