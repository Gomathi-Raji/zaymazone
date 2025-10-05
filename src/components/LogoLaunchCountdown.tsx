import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Fireworks } from 'fireworks-js';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const LogoLaunchCountdown = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isLaunched, setIsLaunched] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [showRevealButton, setShowRevealButton] = useState(false);
  const [manuallyClosed, setManuallyClosed] = useState(false);
  const fireworksRef = useRef<HTMLDivElement>(null);
  const fireworksInstance = useRef<Fireworks | null>(null);

  // Launch date: October 18, 2025 at 8.10pm
  const launchDate = new Date('2025-10-18T20:10:00').getTime();

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = launchDate - now;

      if (distance < 0) {
        clearInterval(timer);
        setIsLaunched(true);
        // Trigger Diwali crackers effect
        triggerDiwaliCrackers();
        return;
      }

      const daysLeft = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hoursLeft = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutesLeft = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const secondsLeft = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({
        days: daysLeft,
        hours: hoursLeft,
        minutes: minutesLeft,
        seconds: secondsLeft,
      });

      // Trigger subtle crackers on special moments - more frequent for testing
      if (secondsLeft === 0) {
        // Every minute for testing
        setTimeout(() => triggerCountdownCrackers(), 100);
      } else if (secondsLeft % 5 === 0 && Math.random() < 0.5) {
        // Every 5 seconds (50% chance) for testing
        setTimeout(() => triggerCountdownCrackers(), 100);
      }

      // Only auto-show countdown when 14 days or less remaining (for testing/development)
      // But don't show if user has manually closed it
      if (daysLeft <= 14 && isVisible === false && !manuallyClosed) {
        setIsVisible(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [launchDate, isVisible, manuallyClosed]);

  // Initialize and manage continuous fireworks
  useEffect(() => {
    if (isVisible && !isLaunched && fireworksRef.current) {
      // Initialize fireworks with all available options and sound
      fireworksInstance.current = new Fireworks(fireworksRef.current, {
        autoresize: true,
        opacity: 0.5,
        acceleration: 1.05,
        friction: 0.97,
        gravity: 1.5,
        particles: 50,
        traceLength: 3,
        traceSpeed: 10,
        explosion: 5,
        intensity: 30,
        flickering: 50,
        lineStyle: 'round',
        hue: {
          min: 0,
          max: 360
        },
        delay: {
          min: 1000,
          max: 3000
        },
        rocketsPoint: {
          min: 0,
          max: 100
        },
        lineWidth: {
          explosion: {
            min: 1,
            max: 3
          },
          trace: {
            min: 1,
            max: 2
          }
        },
        brightness: {
          min: 50,
          max: 80
        },
        decay: {
          min: 0.015,
          max: 0.03
        },
        mouse: {
          click: false,
          move: false,
          max: 1
        },
        sound: {
          enabled: true,
          files: [
            'https://fireworks.js.org/sounds/explosion0.mp3',
            'https://fireworks.js.org/sounds/explosion1.mp3',
            'https://fireworks.js.org/sounds/explosion2.mp3',
            'https://fireworks.js.org/sounds/explosion0.mp3', // Repeat for more variety
            'https://fireworks.js.org/sounds/explosion1.mp3',
            'https://fireworks.js.org/sounds/explosion2.mp3'
          ],
          volume: {
            min: 6,
            max: 12
          }
        }
      });

      // Start continuous fireworks
      fireworksInstance.current.start();

      // Set up interval for additional bursts with enhanced patterns
      const fireworksInterval = setInterval(() => {
        if (fireworksInstance.current) {
          const patternType = Math.random();

          if (patternType < 0.4) {
            // Standard burst: 1-3 fireworks
            const launchCount = Math.floor(Math.random() * 3) + 1;
            fireworksInstance.current.launch(launchCount);
          } else if (patternType < 0.7) {
            // Rapid succession burst
            for (let i = 0; i < 3; i++) {
              setTimeout(() => {
                fireworksInstance.current?.launch(1);
              }, i * 200);
            }
          } else {
            // Spectacular cascade
            const cascadeCount = Math.floor(Math.random() * 4) + 3; // 3-6 fireworks
            for (let i = 0; i < cascadeCount; i++) {
              setTimeout(() => {
                fireworksInstance.current?.launch(1);
              }, i * 150 + Math.random() * 100);
            }
          }

          // Enhanced confetti burst with sound simulation
          if (Math.random() < 0.5) { // 50% chance for extra burst
            setTimeout(() => {
              // Create a "ground burst" effect near the bottom
              confetti({
                particleCount: Math.random() * 30 + 20,
                startVelocity: Math.random() * 40 + 30,
                spread: Math.random() * 80 + 50,
                origin: {
                  x: Math.random(),
                  y: 0.85 + Math.random() * 0.15,
                },
                colors: ['#ff4757', '#3742fa', '#2f3542', '#ffa502', '#ff6348', '#7bed9f', '#70a1ff'],
                gravity: 0.6,
                drift: Math.random() * 0.6 - 0.3,
                ticks: 150,
                shapes: ['circle', 'square'],
                scalar: 1.2,
              });

              // Add secondary burst for echo effect
              setTimeout(() => {
                confetti({
                  particleCount: Math.random() * 15 + 10,
                  startVelocity: Math.random() * 25 + 15,
                  spread: Math.random() * 60 + 40,
                  origin: {
                    x: Math.random(),
                    y: 0.8 + Math.random() * 0.1,
                  },
                  colors: ['#ffffff', '#ffd700', '#ffed4e'],
                  gravity: 0.4,
                  drift: 0,
                  ticks: 80,
                  shapes: ['star'],
                  scalar: 0.8,
                });
              }, 200);
            }, Math.random() * 1500);
          }
        }
      }, 3500); // Every 3.5 seconds for more dynamic experience

      return () => {
        clearInterval(fireworksInterval);
        if (fireworksInstance.current) {
          fireworksInstance.current.stop();
          fireworksInstance.current = null;
        }
      };
    } else {
      // Stop fireworks when not visible or launched
      if (fireworksInstance.current) {
        fireworksInstance.current.stop();
        fireworksInstance.current = null;
      }
    }
  }, [isVisible, isLaunched]);

  const triggerDiwaliCrackers = () => {
    // Diwali-style confetti with multiple bursts
    const duration = 3000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);

      // Multiple bursts from different origins
      confetti({
        particleCount,
        startVelocity: randomInRange(50, 100),
        spread: randomInRange(50, 70),
        origin: {
          x: randomInRange(0.1, 0.3),
          y: Math.random() - 0.2,
        },
        colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080'],
      });

      confetti({
        particleCount,
        startVelocity: randomInRange(50, 100),
        spread: randomInRange(50, 70),
        origin: {
          x: randomInRange(0.7, 0.9),
          y: Math.random() - 0.2,
        },
        colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080'],
      });
    }, 250);
  };

  const handlePosterClick = () => {
    setShowRevealButton(true);
  };

  const handleRevealNow = () => {
    setIsLaunched(true);

    // Spectacular logo reveal with MAXIMUM fireworks and sound
    if (fireworksInstance.current) {
      // Temporarily boost volume to ABSOLUTE MAXIMUM for reveal
      fireworksInstance.current.updateOptions({
        sound: {
          enabled: true,
          files: [
            'https://fireworks.js.org/sounds/explosion0.mp3',
            'https://fireworks.js.org/sounds/explosion1.mp3',
            'https://fireworks.js.org/sounds/explosion2.mp3',
            'https://fireworks.js.org/sounds/explosion0.mp3',
            'https://fireworks.js.org/sounds/explosion1.mp3',
            'https://fireworks.js.org/sounds/explosion2.mp3'
          ],
          volume: {
            min: 20,
            max: 25
          }
        }
      });

      // Launch ULTIMATE fireworks barrage for logo reveal
      const revealBarrage = () => {
        // First wave: 12 simultaneous fireworks (increased from 8)
        for (let i = 0; i < 12; i++) {
          setTimeout(() => {
            fireworksInstance.current?.launch(1);
          }, i * 25); // Even faster timing
        }

        // Second wave: Rapid cascade - 18 fireworks (increased from 12)
        setTimeout(() => {
          for (let i = 0; i < 18; i++) {
            setTimeout(() => {
              fireworksInstance.current?.launch(1);
            }, i * 35); // Faster
          }
        }, 200);

        // Third wave: Spectacular finale - 25 fireworks (increased from 15)
        setTimeout(() => {
          for (let i = 0; i < 25; i++) {
            setTimeout(() => {
              fireworksInstance.current?.launch(1);
            }, i * 30 + Math.random() * 60); // More random timing
          }
        }, 500);

        // Fourth wave: Maximum barrage - 30 fireworks (increased from 20)
        setTimeout(() => {
          for (let i = 0; i < 30; i++) {
            setTimeout(() => {
              const launchCount = Math.floor(Math.random() * 3) + 1; // 1-3 fireworks each
              fireworksInstance.current?.launch(launchCount);
            }, i * 25 + Math.random() * 80);
          }
        }, 800);

        // Fifth wave: Ultimate barrage - 20 more fireworks
        setTimeout(() => {
          for (let i = 0; i < 20; i++) {
            setTimeout(() => {
              const launchCount = Math.floor(Math.random() * 2) + 2; // 2-3 fireworks each
              fireworksInstance.current?.launch(launchCount);
            }, i * 40 + Math.random() * 60);
          }
        }, 1200);

        // Continuous barrage for 5 seconds (increased from 4)
        let barrageCount = 0;
        const barrageInterval = setInterval(() => {
          if (barrageCount < 30) { // Increased from 20
            const launchCount = Math.floor(Math.random() * 4) + 1; // 1-4 fireworks per burst
            fireworksInstance.current?.launch(launchCount);
            barrageCount++;
          } else {
            clearInterval(barrageInterval);
            // Reset volume back to normal after reveal
            setTimeout(() => {
              if (fireworksInstance.current) {
                fireworksInstance.current.updateOptions({
                  sound: {
                    enabled: true,
                    files: [
                      'https://fireworks.js.org/sounds/explosion0.mp3',
                      'https://fireworks.js.org/sounds/explosion1.mp3',
                      'https://fireworks.js.org/sounds/explosion2.mp3',
                      'https://fireworks.js.org/sounds/explosion0.mp3',
                      'https://fireworks.js.org/sounds/explosion1.mp3',
                      'https://fireworks.js.org/sounds/explosion2.mp3'
                    ],
                    volume: {
                      min: 6,
                      max: 12
                    }
                  }
                });
              }
            }, 3000);
          }
        }, 120); // Faster interval (120ms instead of 150ms)
      };

      revealBarrage();
    }

    // ULTIMATE confetti effects for maximum spectacle
    setTimeout(() => {
      // Massive center burst - maximum particles
      confetti({
        particleCount: 400, // Increased from 300
        startVelocity: 95, // Increased from 85
        spread: 360,
        origin: { x: 0.5, y: 0.5 },
        colors: ['#ffd700', '#ffed4e', '#f1c40f', '#e74c3c', '#9b59b6', '#3498db', '#2ecc71', '#f0932b', '#e67e22', '#f39c12', '#ff6b6b', '#4ecdc4'],
        gravity: 0.3,
        drift: 0,
        ticks: 500, // Increased duration
        shapes: ['star', 'circle'],
        scalar: 2.0, // Larger particles
      });

      // Side bursts - maximum particles
      setTimeout(() => {
        confetti({
          particleCount: 300, // Increased from 200
          startVelocity: 80, // Increased from 70
          spread: 200,
          origin: { x: 0.15, y: 0.25 },
          colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7', '#a29bfe'],
          gravity: 0.4,
          drift: 0.4,
          ticks: 400, // Increased duration
          shapes: ['circle', 'star'],
          scalar: 1.6,
        });

        confetti({
          particleCount: 300, // Increased from 200
          startVelocity: 80, // Increased from 70
          spread: 200,
          origin: { x: 0.85, y: 0.25 },
          colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7', '#a29bfe'],
          gravity: 0.4,
          drift: -0.4,
          ticks: 400, // Increased duration
          shapes: ['circle', 'star'],
          scalar: 1.6,
        });
      }, 100);

      // Ground level bursts - maximum count and particles
      setTimeout(() => {
        for (let i = 0; i < 12; i++) { // Increased from 8
          setTimeout(() => {
            confetti({
              particleCount: 150, // Increased from 120
              startVelocity: 65, // Increased from 55
              spread: 160, // Increased from 140
              origin: { x: 0.06 + (i * 0.08), y: 0.9 }, // Adjusted spacing
              colors: ['#ff4757', '#3742fa', '#2f3542', '#ffa502', '#ff6348', '#7bed9f', '#70a1ff', '#5352ed', '#ff3838'],
              gravity: 0.7,
              drift: Math.random() * 0.6 - 0.3,
              ticks: 300, // Increased duration
              shapes: ['square', 'circle', 'star'],
              scalar: 1.4,
            });
          }, i * 60); // Faster sequence
        }
      }, 300);

      // Additional top bursts for ultimate effect
      setTimeout(() => {
        for (let i = 0; i < 8; i++) { // Increased from 5
          setTimeout(() => {
            confetti({
              particleCount: 200, // Increased from 150
              startVelocity: 70,
              spread: 100,
              origin: { x: 0.08 + (i * 0.12), y: 0.08 },
              colors: ['#ffd700', '#ffed4e', '#f1c40f', '#e74c3c', '#9b59b6', '#ff6b6b', '#4ecdc4'],
              gravity: 0.5,
              drift: Math.random() * 0.5 - 0.25,
              ticks: 250,
              shapes: ['star', 'circle'],
              scalar: 1.2,
            });
          }, i * 75);
        }
      }, 150);

      // Extra side barrages for maximum celebration
      setTimeout(() => {
        for (let i = 0; i < 6; i++) {
          setTimeout(() => {
            confetti({
              particleCount: 180,
              startVelocity: 75,
              spread: 120,
              origin: { x: 0.05 + (i * 0.15), y: 0.4 },
              colors: ['#fd79a8', '#00b894', '#00cec9', '#55a3ff', '#fdcb6e', '#e17055'],
              gravity: 0.6,
              drift: Math.random() * 0.4 - 0.2,
              ticks: 200,
              shapes: ['circle'],
              scalar: 1.0,
            });
          }, i * 50);
        }
      }, 250);
    }, 25); // Start confetti even earlier
  };

  const triggerCountdownCrackers = () => {
    // Spectacular Diwali cracker effects with enhanced sound integration
    const burstOrigins = [
      { x: 0.2, y: 0.4 }, // Left side
      { x: 0.8, y: 0.4 }, // Right side
      { x: 0.5, y: 0.2 }, // Top center
      { x: 0.35, y: 0.6 }, // Bottom left
      { x: 0.65, y: 0.6 }, // Bottom right
      { x: 0.15, y: 0.3 }, // Top left
      { x: 0.85, y: 0.3 }, // Top right
      { x: 0.3, y: 0.5 }, // Center left
      { x: 0.7, y: 0.5 }, // Center right
    ];

    // Randomly select 5-6 origins for maximum spectacle
    const selectedOrigins = burstOrigins
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 2) + 5);

    // Enhanced effect types with more vibrant colors and effects
    const effectTypes = [
      {
        // Golden Diwali burst
        particleCount: Math.random() * 25 + 20,
        startVelocity: Math.random() * 40 + 35,
        spread: Math.random() * 70 + 50,
        colors: ['#ffd700', '#ffed4e', '#f1c40f', '#f39c12', '#e67e22', '#d35400', '#e74c3c'],
        gravity: 0.3,
        drift: Math.random() * 0.6 - 0.3,
        ticks: 160,
        shapes: ['star'],
        scalar: 1.0
      },
      {
        // Rainbow celebration
        particleCount: Math.random() * 30 + 25,
        startVelocity: Math.random() * 35 + 30,
        spread: Math.random() * 80 + 45,
        colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7', '#a29bfe', '#fd79a8', '#00b894', '#00cec9', '#55a3ff'],
        gravity: 0.5,
        drift: Math.random() * 0.5 - 0.25,
        ticks: 130,
        shapes: ['circle'],
        scalar: 1.4
      },
      {
        // Royal burst with metallic effects
        particleCount: Math.random() * 22 + 18,
        startVelocity: Math.random() * 45 + 30,
        spread: Math.random() * 65 + 45,
        colors: ['#e74c3c', '#9b59b6', '#3498db', '#2ecc71', '#f1c40f', '#e67e22', '#8e44ad', '#34495e', '#16a085'],
        gravity: 0.4,
        drift: Math.random() * 0.7 - 0.35,
        ticks: 120,
        shapes: ['square'],
        scalar: 1.2
      },
      {
        // Sparkling finale
        particleCount: Math.random() * 20 + 15,
        startVelocity: Math.random() * 50 + 25,
        spread: Math.random() * 90 + 60,
        colors: ['#ffffff', '#ffd700', '#ffed4e', '#f1c40f', '#ecf0f1', '#bdc3c7'],
        gravity: 0.2,
        drift: Math.random() * 0.4 - 0.2,
        ticks: 180,
        shapes: ['star'],
        scalar: 0.7
      }
    ];

    selectedOrigins.forEach((origin, index) => {
      // Create multiple layered effects for each origin
      const effectType = effectTypes[Math.floor(Math.random() * effectTypes.length)];

      // Main burst with guaranteed sound effect
      setTimeout(() => {
        confetti({
          ...effectType,
          origin: {
            x: origin.x + (Math.random() - 0.5) * 0.2,
            y: origin.y + (Math.random() - 0.5) * 0.2,
          },
        });

        // Always trigger fireworks sound for main bursts
        if (fireworksInstance.current) {
          setTimeout(() => {
            fireworksInstance.current?.launch(1);
          }, 50);
        }
      }, index * 150);

      // Enhanced secondary burst for depth
      setTimeout(() => {
        confetti({
          particleCount: Math.floor(effectType.particleCount * 0.8),
          startVelocity: effectType.startVelocity * 0.9,
          spread: effectType.spread * 0.85,
          origin: {
            x: origin.x + (Math.random() - 0.5) * 0.15,
            y: origin.y + (Math.random() - 0.5) * 0.15,
          },
          colors: effectType.colors.slice(0, 5),
          gravity: effectType.gravity * 1.4,
          drift: effectType.drift * 0.7,
          ticks: effectType.ticks * 0.95,
          shapes: effectType.shapes,
          scalar: effectType.scalar * 0.9,
        });
      }, index * 150 + 60);

      // Enhanced sparkle trail with sound
      if (Math.random() < 0.6) { // 60% chance for sparkle trail
        setTimeout(() => {
          confetti({
            particleCount: 12,
            startVelocity: 20,
            spread: 100,
            origin: {
              x: origin.x + (Math.random() - 0.5) * 0.1,
              y: origin.y + 0.15,
            },
            colors: ['#ffffff', '#ffd700', '#ffed4e', '#f1c40f', '#ecf0f1'],
            gravity: 0.2,
            drift: Math.random() * 0.2 - 0.1,
            ticks: 80,
            shapes: ['star'],
            scalar: 0.7,
          });
        }, index * 150 + 30);
      }
    });

    // Enhanced sweeping effect with sound cascade
    if (Math.random() < 0.5) { // 50% chance for sweeping effect
      setTimeout(() => {
        for (let i = 0; i < 7; i++) {
          setTimeout(() => {
            confetti({
              particleCount: 10,
              startVelocity: 25,
              spread: 40,
              origin: {
                x: 0.06 + (i * 0.12), // Sweep from left to right
                y: 0.1,
              },
              colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b'],
              gravity: 0.3,
              drift: 0.15,
              ticks: 100,
              shapes: ['circle'],
              scalar: 1.0,
            });

            // Add fireworks launch for sweeping effect
            if (i % 2 === 0 && fireworksInstance.current) {
              setTimeout(() => {
                fireworksInstance.current?.launch(1);
              }, 25);
            }
          }, i * 100);
        }
      }, 200);
    }

    // Spectacular finale with multiple fireworks
    if (fireworksInstance.current) {
      setTimeout(() => {
        const finaleCount = Math.floor(Math.random() * 3) + 3; // 3-5 fireworks
        for (let i = 0; i < finaleCount; i++) {
          setTimeout(() => {
            fireworksInstance.current?.launch(1);
          }, i * 100);
        }
      }, 400);
    }
  };

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <motion.div
      className="flex flex-col items-center mx-2 sm:mx-4"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <motion.div
        className="bg-white/20 backdrop-blur-sm rounded-lg p-3 sm:p-4 min-w-[60px] sm:min-w-[80px] text-center border border-white/30"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <motion.span
          className="text-2xl sm:text-4xl font-bold text-white"
          key={value}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {value.toString().padStart(2, '0')}
        </motion.span>
      </motion.div>
      <span className="text-white/80 text-xs sm:text-sm mt-2 font-medium uppercase tracking-wide">
        {label}
      </span>
    </motion.div>
  );

  if (!isVisible) {
    return (
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-primary hover:bg-primary/80 text-white px-4 py-3 rounded-full text-sm font-medium shadow-xl transition-all duration-300 hover:scale-105 border-2 border-white/20"
          title="Show Logo Launch Countdown"
        >
          Logo?
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      {/* Fireworks Container */}
      <div
        ref={fireworksRef}
        className="fixed inset-0 pointer-events-none z-10 w-screen h-screen"
      />

      {/* Close Button */}
      <button
        onClick={() => {
          setIsVisible(false);
          setManuallyClosed(true);
        }}
        className="absolute top-4 right-4 z-60 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
        title="Close countdown (for development)"
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <AnimatePresence>
        {!isLaunched ? (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h2
              className="text-3xl sm:text-5xl font-bold text-white mb-8"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Logo Launch Countdown
            </motion.h2>
            <motion.p
              className="text-white/70 mb-8 text-lg"
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Get ready for something amazing! Our new logo launches in...
            </motion.p>
            <motion.div
              className="mb-8"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <img
                src="/logo-invitation.png"
                alt="Logo Invitation"
                className="w-32 h-32 sm:w-48 sm:h-48 mx-auto object-contain rounded-lg shadow-2xl cursor-pointer hover:scale-105 transition-transform duration-300"
                onClick={handlePosterClick}
                title="Click to reveal the logo now!"
              />
            </motion.div>
            <AnimatePresence>
              {showRevealButton && (
                <motion.div
                  className="mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <button
                    onClick={handleRevealNow}
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white px-8 py-3 rounded-full text-lg font-bold shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-white/30"
                  >
                    🎉 Reveal Now! 🎉
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex justify-center items-center flex-wrap">
              <TimeUnit value={timeLeft.days} label="Days" />
              <TimeUnit value={timeLeft.hours} label="Hours" />
              <TimeUnit value={timeLeft.minutes} label="Minutes" />
              <TimeUnit value={timeLeft.seconds} label="Seconds" />
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, type: "spring", stiffness: 200, damping: 20 }}
          >
            <motion.h2
              className="text-4xl sm:text-6xl font-bold text-white mb-8"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
            >
              🎉 Happy Diwali! 🎉
            </motion.h2>
            <motion.div
              className="mb-8"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 1, duration: 1, type: "spring", stiffness: 200 }}
            >
              <img
                src="/assets/logo.png"
                alt="Zaymazone Logo"
                className="w-32 h-32 sm:w-48 sm:h-48 mx-auto rounded-full shadow-2xl border-4 border-white/50"
              />
            </motion.div>
            <motion.p
              className="text-white text-xl sm:text-2xl font-semibold"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.8 }}
            >
              Welcome to our new brand identity!
            </motion.p>
            <motion.button
              className="mt-8 px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/80 transition-colors"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 2, duration: 0.8 }}
              onClick={() => window.location.reload()}
            >
              Continue to Zaymazone
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LogoLaunchCountdown;