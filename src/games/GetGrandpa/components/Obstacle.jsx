import './Obstacle.css';

/**
 * Obstacle component - trees, fences, snowmen
 * @param {number} x - X position in game coordinates
 * @param {number} y - Y position in game coordinates
 * @param {string} type - Type of obstacle: 'tree', 'fence', 'snowman'
 */
export default function Obstacle({ x, y, type }) {
  // Convert game coordinates to percentages
  const left = (x / 800) * 100;
  const top = (y / 600) * 100;

  return (
    <div
      className={`obstacle obstacle-${type}`}
      style={{
        left: `${left}%`,
        top: `${top}%`,
      }}
    >
      {type === 'tree' && <Tree />}
      {type === 'fence' && <Fence />}
      {type === 'snowman' && <Snowman />}
    </div>
  );
}

function Tree() {
  return (
    <div className="tree">
      {/* Snow-covered pine tree layers */}
      <div className="tree-layer tree-layer-1" />
      <div className="tree-layer tree-layer-2" />
      <div className="tree-layer tree-layer-3" />
      <div className="tree-trunk" />
      {/* Snow on ground */}
      <div className="tree-snow-base" />
    </div>
  );
}

function Fence() {
  return (
    <div className="fence">
      <div className="fence-post" />
      <div className="fence-post" />
      <div className="fence-post" />
      <div className="fence-rail fence-rail-top" />
      <div className="fence-rail fence-rail-bottom" />
      {/* Snow on top */}
      <div className="fence-snow" />
    </div>
  );
}

function Snowman() {
  return (
    <div className="snowman">
      {/* Bottom ball */}
      <div className="snowman-ball snowman-bottom" />
      {/* Middle ball */}
      <div className="snowman-ball snowman-middle">
        <div className="snowman-button" />
        <div className="snowman-button" />
      </div>
      {/* Head */}
      <div className="snowman-ball snowman-head">
        <div className="snowman-eyes">
          <div className="snowman-eye" />
          <div className="snowman-eye" />
        </div>
        <div className="snowman-nose" />
        <div className="snowman-mouth" />
      </div>
      {/* Hat */}
      <div className="snowman-hat" />
      {/* Arms */}
      <div className="snowman-arm snowman-arm-left" />
      <div className="snowman-arm snowman-arm-right" />
    </div>
  );
}
