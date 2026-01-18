import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './GetGrandpa.css';

import Grandpa from './components/Grandpa';
import Snowball from './components/Snowball';
import Obstacle from './components/Obstacle';
import SwipeIndicator from './components/SwipeIndicator';
import useGameLoop from './hooks/useGameLoop';
import useSwipeInput from './hooks/useSwipeInput';

// Game constants
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PLAYER_Y = GAME_HEIGHT - 50; // Player position at bottom
const GRAVITY = 0.15; // Lower gravity so snowballs fly further
const MAX_PLAYER_HEALTH = 3;
const HITS_TO_WIN = 5;

// Obstacle positions (x, y, type)
const OBSTACLES = [
  { id: 1, x: 100, y: 300, type: 'tree' },
  { id: 2, x: 350, y: 280, type: 'snowman' },
  { id: 3, x: 700, y: 320, type: 'tree' },
  { id: 4, x: 200, y: 380, type: 'fence' },
  { id: 5, x: 550, y: 360, type: 'fence' },
];

export default function GetGrandpa() {
  const gameAreaRef = useRef(null);

  // Game state
  const [gameState, setGameState] = useState('playing'); // 'playing', 'won', 'lost'
  const [playerHealth, setPlayerHealth] = useState(MAX_PLAYER_HEALTH);
  const [score, setScore] = useState(0);
  const [snowballs, setSnowballs] = useState([]);
  const [enemySnowballs, setEnemySnowballs] = useState([]);

  // Grandpa state
  const [grandpaState, setGrandpaState] = useState('hiding'); // 'hiding', 'peeking', 'running', 'throwing', 'hit', 'fleeing'
  const [grandpaPos, setGrandpaPos] = useState({ x: 350, y: 280 }); // Start behind snowman
  const [grandpaTargetObstacle, setGrandpaTargetObstacle] = useState(1); // Index of current hiding spot
  const grandpaTimerRef = useRef(null);
  const [grandpaTiredness, setGrandpaTiredness] = useState(0); // 0 = fresh, increases over time
  const lastHitTimeRef = useRef(Date.now());

  // Refs to track current values for collision detection (avoids stale closures)
  const grandpaPosRef = useRef(grandpaPos);
  const grandpaStateRef = useRef(grandpaState);

  // Keep refs in sync with state
  useEffect(() => {
    grandpaPosRef.current = grandpaPos;
  }, [grandpaPos]);

  useEffect(() => {
    grandpaStateRef.current = grandpaState;
  }, [grandpaState]);

  // Aiming state
  const [isAiming, setIsAiming] = useState(false);
  const [aimStart, setAimStart] = useState({ x: 0, y: 0 });
  const [aimCurrent, setAimCurrent] = useState({ x: 0, y: 0 });

  // Crosshair for keyboard/mouse mode
  const [crosshairPos, setCrosshairPos] = useState({ x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 });
  const [useMouseAim, setUseMouseAim] = useState(false);

  // Snowball ID counter
  const snowballIdRef = useRef(0);

  // Cooldown for throwing (prevents spacebar spam)
  const lastThrowTimeRef = useRef(0);
  const THROW_COOLDOWN = 500; // milliseconds between throws

  // Get obstacle by ID
  const getObstacle = (id) => OBSTACLES.find(o => o.id === id);

  // Calculate throw velocity from drag
  const calculateThrowVelocity = useCallback((start, end) => {
    const dx = start.x - end.x;
    const dy = start.y - end.y;
    const power = Math.min(Math.sqrt(dx * dx + dy * dy) / 4, 35); // More power, higher cap
    const angle = Math.atan2(dy, dx);
    return {
      vx: Math.cos(angle) * power,
      vy: Math.sin(angle) * power
    };
  }, []);

  // Throw a snowball
  const throwSnowball = useCallback((startX, startY, vx, vy) => {
    const id = ++snowballIdRef.current;
    setSnowballs(prev => [...prev, {
      id,
      x: startX,
      y: startY,
      vx,
      vy,
      time: 0
    }]);
  }, []);

  // Handle swipe/drag input
  const handleSwipeStart = useCallback((x, y) => {
    if (gameState !== 'playing') return;
    setIsAiming(true);
    setAimStart({ x, y });
    setAimCurrent({ x, y });
  }, [gameState]);

  const handleSwipeMove = useCallback((x, y) => {
    if (!isAiming) return;
    setAimCurrent({ x, y });
  }, [isAiming]);

  const handleSwipeEnd = useCallback(() => {
    if (!isAiming || gameState !== 'playing') {
      setIsAiming(false);
      return;
    }

    // Check cooldown
    const now = Date.now();
    if (now - lastThrowTimeRef.current < THROW_COOLDOWN) {
      setIsAiming(false);
      return;
    }

    const { vx, vy } = calculateThrowVelocity(aimStart, aimCurrent);
    if (Math.abs(vx) > 1 || Math.abs(vy) > 1) {
      lastThrowTimeRef.current = now;
      throwSnowball(GAME_WIDTH / 2, PLAYER_Y, vx, vy);
    }

    setIsAiming(false);
  }, [isAiming, aimStart, aimCurrent, calculateThrowVelocity, throwSnowball, gameState]);

  // Use swipe input hook
  useSwipeInput(gameAreaRef, handleSwipeStart, handleSwipeMove, handleSwipeEnd);

  // Mouse move for crosshair aiming
  const handleMouseMove = useCallback((e) => {
    if (!gameAreaRef.current || isAiming) return;
    const rect = gameAreaRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * GAME_WIDTH;
    const y = ((e.clientY - rect.top) / rect.height) * GAME_HEIGHT;
    setCrosshairPos({ x, y });
    setUseMouseAim(true);
  }, [isAiming]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'playing') return;

      if (e.code === 'Space' && useMouseAim) {
        e.preventDefault();

        // Check cooldown
        const now = Date.now();
        if (now - lastThrowTimeRef.current < THROW_COOLDOWN) {
          return; // Still on cooldown
        }
        lastThrowTimeRef.current = now;

        // Calculate velocity toward crosshair - aim high to lob snowballs
        const dx = crosshairPos.x - GAME_WIDTH / 2;
        const dy = crosshairPos.y - PLAYER_Y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const power = Math.min(dist / 30, 15);
        const vx = (dx / dist) * power;
        const vy = (dy / dist) * power;
        throwSnowball(GAME_WIDTH / 2, PLAYER_Y, vx, vy);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [crosshairPos, throwSnowball, useMouseAim, gameState]);

  // Check collision between snowball and grandpa (uses refs to avoid stale closures)
  const checkGrandpaCollision = useCallback((snowball) => {
    const currentState = grandpaStateRef.current;
    const currentPos = grandpaPosRef.current;

    // Allow hits when grandpa is peeking, running, or throwing (not hiding)
    if (currentState === 'hiding' || currentState === 'hit') return false;

    const grandpaWidth = 70;
    const grandpaHeight = 110;

    return (
      snowball.x > currentPos.x - grandpaWidth / 2 &&
      snowball.x < currentPos.x + grandpaWidth / 2 &&
      snowball.y > currentPos.y - grandpaHeight / 2 &&
      snowball.y < currentPos.y + grandpaHeight / 2
    );
  }, []);

  // Check collision with obstacles
  const checkObstacleCollision = useCallback((snowball) => {
    for (const obstacle of OBSTACLES) {
      const width = obstacle.type === 'fence' ? 120 : 80;
      const height = obstacle.type === 'tree' ? 150 : 100;

      if (
        snowball.x > obstacle.x - width / 2 &&
        snowball.x < obstacle.x + width / 2 &&
        snowball.y > obstacle.y - height / 2 &&
        snowball.y < obstacle.y + height / 2
      ) {
        return true;
      }
    }
    return false;
  }, []);

  // Refs to track current snowball positions for collision detection
  const snowballsRef = useRef([]);
  const enemySnowballsRef = useRef([]);

  // Keep refs in sync
  useEffect(() => {
    snowballsRef.current = snowballs;
  }, [snowballs]);

  useEffect(() => {
    enemySnowballsRef.current = enemySnowballs;
  }, [enemySnowballs]);

  // Game loop - update snowball positions
  useGameLoop((deltaTime) => {
    if (gameState !== 'playing') return;

    // Track which snowballs collided mid-air
    const collidedPlayerIds = new Set();
    const collidedEnemyIds = new Set();

    // Check for snowball-to-snowball collisions first
    const currentPlayerBalls = snowballsRef.current;
    const currentEnemyBalls = enemySnowballsRef.current;

    for (const playerBall of currentPlayerBalls) {
      for (const enemyBall of currentEnemyBalls) {
        const dx = playerBall.x - enemyBall.x;
        const dy = playerBall.y - enemyBall.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 30) { // Collision radius
          collidedPlayerIds.add(playerBall.id);
          collidedEnemyIds.add(enemyBall.id);
        }
      }
    }

    // Update player snowballs
    setSnowballs(prev => {
      const updated = prev.map(ball => ({
        ...ball,
        x: ball.x + ball.vx,
        y: ball.y + ball.vy,
        vy: ball.vy + GRAVITY,
        time: ball.time + deltaTime
      })).filter(ball => {
        // Remove if collided mid-air
        if (collidedPlayerIds.has(ball.id)) {
          return false;
        }
        // Remove if off screen
        if (ball.y > GAME_HEIGHT + 50 || ball.y < -50 || ball.x < -50 || ball.x > GAME_WIDTH + 50) {
          return false;
        }
        // Check obstacle collision
        if (checkObstacleCollision(ball)) {
          return false;
        }
        // Check grandpa collision
        if (checkGrandpaCollision(ball)) {
          // Calculate tiredness based on time since last hit
          const timeSinceLastHit = Date.now() - lastHitTimeRef.current;
          const additionalTiredness = Math.min(timeSinceLastHit / 5000, 2); // Max 2 tiredness per hit
          setGrandpaTiredness(t => Math.min(t + additionalTiredness, 5)); // Cap at 5
          lastHitTimeRef.current = Date.now();

          setGrandpaState('hit');
          setScore(s => s + 1);

          // After brief hit animation, flee to new location
          setTimeout(() => {
            setGrandpaState('fleeing');
          }, 300);
          return false;
        }
        return true;
      });
      return updated;
    });

    // Update enemy snowballs
    setEnemySnowballs(prev => {
      const updated = prev.map(ball => ({
        ...ball,
        x: ball.x + ball.vx,
        y: ball.y + ball.vy,
        scale: ball.scale + 0.02, // Grow as it approaches
        time: ball.time + deltaTime
      })).filter(ball => {
        // Remove if collided mid-air (deflected!)
        if (collidedEnemyIds.has(ball.id)) {
          return false;
        }
        // Check if hit player (bottom center of screen)
        if (ball.y > PLAYER_Y - 30 && ball.scale > 1.5) {
          setPlayerHealth(h => h - 1);
          return false;
        }
        // Remove if off screen
        if (ball.y > GAME_HEIGHT + 50) {
          return false;
        }
        return true;
      });
      return updated;
    });
  });

  // Grandpa AI state machine
  useEffect(() => {
    if (gameState !== 'playing') return;

    // Clear any existing timer
    if (grandpaTimerRef.current) {
      clearTimeout(grandpaTimerRef.current);
    }

    switch (grandpaState) {
      case 'hiding':
        // Peek out after 1-2 seconds (shorter hiding time)
        grandpaTimerRef.current = setTimeout(() => {
          setGrandpaState(Math.random() > 0.3 ? 'peeking' : 'running');
        }, 1000 + Math.random() * 1000);
        break;

      case 'peeking':
        // Stay visible longer (2-4 seconds) before throwing or hiding
        grandpaTimerRef.current = setTimeout(() => {
          if (Math.random() > 0.5) {
            setGrandpaState('throwing');
          } else {
            setGrandpaState('running'); // More likely to run (stay visible) than hide
          }
        }, 2000 + Math.random() * 2000);
        break;

      case 'throwing':
        // Throw snowball at player - use ref to get current position
        setEnemySnowballs(prev => {
          const enemyId = ++snowballIdRef.current;
          return [...prev, {
            id: enemyId,
            x: grandpaPos.x,
            y: grandpaPos.y,
            vx: (GAME_WIDTH / 2 - grandpaPos.x) / 50 + (Math.random() - 0.5) * 4,
            vy: 3 + Math.random() * 2,
            scale: 0.5,
            time: 0
          }];
        });

        // Stay visible longer after throwing (1.5 seconds)
        grandpaTimerRef.current = setTimeout(() => {
          setGrandpaState('peeking'); // Go to peeking instead of hiding
        }, 1500);
        break;

      case 'running':
        // Pick a new obstacle to hide behind
        setGrandpaTargetObstacle(prev => {
          const availableObstacles = OBSTACLES.filter(o => o.id !== prev);
          const newTarget = availableObstacles[Math.floor(Math.random() * availableObstacles.length)];
          // Update position to new obstacle
          setGrandpaPos({ x: newTarget.x, y: newTarget.y });
          return newTarget.id;
        });

        // Stay visible longer while running (2.5 seconds)
        grandpaTimerRef.current = setTimeout(() => {
          setGrandpaState('peeking'); // Go to peeking instead of hiding
        }, 2500);
        break;

      case 'hit':
        // Already handled by collision detection
        break;

      case 'fleeing':
        // Quickly move to a new obstacle after being hit
        setGrandpaTargetObstacle(prev => {
          const availableObstacles = OBSTACLES.filter(o => o.id !== prev);
          const newTarget = availableObstacles[Math.floor(Math.random() * availableObstacles.length)];
          setGrandpaPos({ x: newTarget.x, y: newTarget.y });
          return newTarget.id;
        });

        // Base flee time is fast (0.8s), but gets slower with tiredness
        const fleeTime = 800 + (grandpaTiredness * 400); // 0.8s to 2.8s based on tiredness
        grandpaTimerRef.current = setTimeout(() => {
          setGrandpaState('hiding');
        }, fleeTime);
        break;

      default:
        break;
    }

    return () => {
      if (grandpaTimerRef.current) {
        clearTimeout(grandpaTimerRef.current);
      }
    };
  }, [grandpaState, gameState]); // Removed grandpaTargetObstacle and grandpaPos to prevent re-triggering

  // Check win/lose conditions
  useEffect(() => {
    if (score >= HITS_TO_WIN) {
      setGameState('won');
    } else if (playerHealth <= 0) {
      setGameState('lost');
    }
  }, [score, playerHealth]);

  // Reset game
  const resetGame = () => {
    setGameState('playing');
    setPlayerHealth(MAX_PLAYER_HEALTH);
    setScore(0);
    setSnowballs([]);
    setEnemySnowballs([]);
    setGrandpaState('hiding');
    setGrandpaPos({ x: 350, y: 280 });
    setGrandpaTargetObstacle(1);
    setGrandpaTiredness(0);
    lastHitTimeRef.current = Date.now();
  };

  return (
    <div className="get-grandpa-container">
      <div className="game-header">
        <Link to="/" className="back-button">← Back</Link>
        <h1>Get Grandpa!</h1>
        <div className="game-stats">
          <div className="health">
            {Array.from({ length: MAX_PLAYER_HEALTH }).map((_, i) => (
              <span key={i} className={`heart ${i < playerHealth ? 'full' : 'empty'}`}>
                {i < playerHealth ? '❤️' : '🖤'}
              </span>
            ))}
          </div>
          <div className="score">Hits: {score} / {HITS_TO_WIN}</div>
        </div>
      </div>

      <div
        className="game-area"
        ref={gameAreaRef}
        onMouseMove={handleMouseMove}
      >
        {/* Sky and ground background */}
        <div className="sky" />
        <div className="ground" />

        {/* Obstacles */}
        {OBSTACLES.map(obstacle => (
          <Obstacle key={obstacle.id} {...obstacle} />
        ))}

        {/* Grandpa */}
        <Grandpa
          x={grandpaPos.x}
          y={grandpaPos.y}
          state={grandpaState}
          tiredness={grandpaTiredness}
        />

        {/* Player snowballs */}
        {snowballs.map(ball => (
          <Snowball key={ball.id} x={ball.x} y={ball.y} />
        ))}

        {/* Enemy snowballs */}
        {enemySnowballs.map(ball => (
          <Snowball
            key={ball.id}
            x={ball.x}
            y={ball.y}
            scale={ball.scale}
            isEnemy
          />
        ))}

        {/* Aiming indicator */}
        {isAiming && (
          <SwipeIndicator
            startX={GAME_WIDTH / 2}
            startY={PLAYER_Y}
            aimStart={aimStart}
            aimCurrent={aimCurrent}
          />
        )}

        {/* Crosshair for mouse aim */}
        {useMouseAim && !isAiming && gameState === 'playing' && (
          <div
            className="crosshair"
            style={{
              left: `${(crosshairPos.x / GAME_WIDTH) * 100}%`,
              top: `${(crosshairPos.y / GAME_HEIGHT) * 100}%`
            }}
          />
        )}

        {/* Player indicator */}
        <div className="player">
          <div className="player-body">🧒</div>
          <div className="player-label">You</div>
        </div>

        {/* Game over overlay */}
        {gameState !== 'playing' && (
          <div className="game-over-overlay">
            <div className="game-over-modal">
              <h2>{gameState === 'won' ? '🎉 You Win!' : '❄️ Game Over!'}</h2>
              <p>
                {gameState === 'won'
                  ? `You hit Grandpa ${HITS_TO_WIN} times!`
                  : `Grandpa got you! You scored ${score} hits.`}
              </p>
              <button onClick={resetGame} className="play-again-btn">
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="controls-hint">
        <p>🎯 <strong>Touch/Click + Drag</strong> to aim and throw snowballs</p>
        <p>🖱️ <strong>Mouse + Spacebar</strong> for quick shots</p>
      </div>
    </div>
  );
}
