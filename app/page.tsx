'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  PropertyDeed,
  MONOPOLY_SPACES,
  CHANCE_CARDS,
  ChanceCard,
} from '@/lib/monopoly-board-data';
import { MonopolyBoard, PlayerState } from '@/components/MonopolyBoard';
import { LeftEmpirePanel, RightEmpirePanel } from '@/components/EmpireSidePanels';
import { UnifiedPropertyInspector } from '@/components/UnifiedPropertyInspector';
import { ChanceCardModal } from '@/components/ChanceCardModal';
import { TradeNegotiationModal } from '@/components/TradeNegotiationModal';
import { Turbine3DViewer } from '@/components/Turbine3DViewer';
import { EnergyTimelineModal } from '@/components/EnergyTimelineModal';
import { CompanyCustomizerModal } from '@/components/CompanyCustomizerModal';
import { WeatherModal } from '@/components/WeatherModal';
import { WattCursor } from '@/components/WattCursor';
import { SoundManager } from '@/lib/audio';
import {
  DynamicWeatherEvent,
  DYNAMIC_WEATHER_EVENTS,
  rollDynamicWeather,
  calculateWeatherAdjustedRent,
} from '@/lib/weatherEngine';
import confetti from 'canvas-confetti';
import {
  Wind,
  Handshake,
  History,
  RotateCcw,
  Volume2,
  VolumeX,
  Building2,
  Sparkles,
  CloudLightning,
} from 'lucide-react';

// Player 1 and Player 2 as explicitly requested!
const INITIAL_PLAYERS: PlayerState[] = [
  {
    id: 'p1',
    name: 'Player 1',
    companyName: 'Player 1 Clean Energy',
    companySlogan: 'Pioneering clean megawatts for a resilient zero-carbon grid',
    tokenType: 'turbine',
    color: '#059669', // Emerald
    money: 1500,
    position: 0,
    inCurtailmentTurns: 0,
    propertiesOwned: [1, 3], // Valley Wind parcels
    upgradesBySpace: { 1: 1 },
    totalMWhGenerated: 480,
    spellingScore: 50,
  },
  {
    id: 'p2',
    name: 'Player 2 (AI)',
    companyName: 'Player 2 Grid Dynamics',
    companySlogan: 'Algorithmic transmission and distributed solar arrays',
    tokenType: 'car',
    color: '#2563eb', // Blue
    money: 1500,
    position: 0,
    inCurtailmentTurns: 0,
    propertiesOwned: [6, 8], // Solar parcels
    upgradesBySpace: { 6: 1 },
    totalMWhGenerated: 420,
    spellingScore: 40,
  },
];

export default function WindopolyPage() {
  const [players, setPlayers] = useState<PlayerState[]>(INITIAL_PLAYERS);
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [roundNumber, setRoundNumber] = useState(1);
  const [canRoll, setCanRoll] = useState(true);

  // Dynamic Weather Engine
  const [currentWeather, setCurrentWeather] = useState<DynamicWeatherEvent>(
    DYNAMIC_WEATHER_EVENTS.optimal_breeze
  );
  const [weatherDurationLeft, setWeatherDurationLeft] = useState<number>(
    DYNAMIC_WEATHER_EVENTS.optimal_breeze.durationTurns
  );

  // Walkthrough State
  const [walkthroughStep, setWalkthroughStep] = useState<1 | 2 | 3 | 4>(1);
  const [walkthroughInstruction, setWalkthroughInstruction] = useState<string>(
    'Step 1: Roll the 3D dice to advance.'
  );

  // Modals & Overlays
  const [inspectingDeed, setInspectingDeed] = useState<PropertyDeed | null>(null);
  const [activeChanceCard, setActiveChanceCard] = useState<ChanceCard | null>(null);
  const [isCompanyCustomizerOpen, setIsCompanyCustomizerOpen] = useState(false);
  const [isTradeOpen, setIsTradeOpen] = useState(false);
  const [is3DViewerOpen, setIs3DViewerOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [isWeatherOpen, setIsWeatherOpen] = useState(false);
  const [isSoundMuted, setIsSoundMuted] = useState(false);

  // Quick Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(
    'Roll the 3D dice to begin clean energy dispatch.'
  );

  const activePlayer = players[activePlayerIndex];
  const hasCelebratedRef = useRef(false);
  const cardCounterRef = useRef(0);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  // Weather Rotation
  const handleTurnWeatherAdvance = () => {
    if (weatherDurationLeft > 1) {
      setWeatherDurationLeft((prev) => prev - 1);
    } else {
      const nextWeather = rollDynamicWeather(currentWeather.id);
      setCurrentWeather(nextWeather);
      setWeatherDurationLeft(nextWeather.durationTurns);

      showToast(`Atmospheric Shift: ${nextWeather.name}! ${nextWeather.headline}`);
      SoundManager.playWindWhoosh();

      if (nextWeather.id === 'storm') {
        setTimeout(() => {
          setPlayers((prev) =>
            prev.map((p) => {
              const windProperties = p.propertiesOwned.filter(
                (id) =>
                  MONOPOLY_SPACES[id]?.group === 'brown' ||
                  MONOPOLY_SPACES[id]?.group === 'red' ||
                  MONOPOLY_SPACES[id]?.group === 'green'
              );
              if (windProperties.length > 0) {
                const fee = windProperties.length * nextWeather.maintenanceCostPerProperty;
                showToast(`⚠️ Storm Cut-Out: ${p.name} paid $${fee}M blade inspection fee.`);
                return { ...p, money: Math.max(0, p.money - fee) };
              }
              return p;
            })
          );
        }, 1200);
      }
    }
  };

  const handleSimulateWeatherShift = () => {
    const nextWeather = rollDynamicWeather(currentWeather.id);
    setCurrentWeather(nextWeather);
    setWeatherDurationLeft(nextWeather.durationTurns);
    showToast(`Atmospheric Front Triggered: ${nextWeather.name}!`);
    SoundManager.playWindWhoosh();
  };

  // 3D Dice Roll Result with Physical Hop Physics
  const handleRollComplete = (die1: number, die2: number) => {
    setCanRoll(false);
    const totalMove = die1 + die2;

    if (activePlayer.inCurtailmentTurns > 0) {
      if (die1 === die2) {
        showToast(`Doubles! ${activePlayer.name} cleared grid congestion and broke out of Curtailment!`);
        SoundManager.playSuccessChime();
        setPlayers((prev) =>
          prev.map((p, i) => (i === activePlayerIndex ? { ...p, inCurtailmentTurns: 0 } : p))
        );
      } else {
        showToast(`${activePlayer.name} remains in Curtailment Bay for 1 more turn.`);
        setPlayers((prev) =>
          prev.map((p, i) =>
            i === activePlayerIndex ? { ...p, inCurtailmentTurns: p.inCurtailmentTurns - 1 } : p
          )
        );
        setTimeout(() => handleNextTurn(), 1400);
        return;
      }
    }

    const startPos = activePlayer.position;
    let step = 0;
    const hopDelayMs = 175; // Rhythmic, natural token hopping

    const hopInterval = setInterval(() => {
      step++;
      const currentHopPos = (startPos + step) % 40;

      SoundManager.playDiceClick();

      // Check if GO was passed
      if (currentHopPos === 0) {
        showToast(`⚡ ${activePlayer.name} synchronized to the grid! Collected $200M Clean Production Credit!`);
        SoundManager.playSuccessChime();
        setPlayers((prev) =>
          prev.map((p, i) =>
            i === activePlayerIndex ? { ...p, money: p.money + 200 } : p
          )
        );
      }

      setPlayers((prev) =>
        prev.map((p, i) =>
          i === activePlayerIndex ? { ...p, position: currentHopPos } : p
        )
      );

      if (step >= totalMove) {
        clearInterval(hopInterval);
        const finalSpace = MONOPOLY_SPACES[currentHopPos];
        setWalkthroughStep(2);
        setWalkthroughInstruction(`Step 2: Inspect ${finalSpace.name} & explore the vocabulary.`);

        setTimeout(() => {
          evaluateSpaceAction(finalSpace, activePlayer.money);
        }, 250);
      }
    }, hopDelayMs);
  };

  const evaluateSpaceAction = (space: PropertyDeed, currentMoney: number) => {
    setWalkthroughStep(3);
    setWalkthroughInstruction(`Step 3: Action for ${space.name}.`);

    switch (space.type) {
      case 'property':
      case 'transit':
      case 'utility':
        setInspectingDeed(space);
        break;

      case 'chance':
      case 'community_chest': {
        const deckType = space.type === 'chance' ? 'dispatch' : 'climate';
        const cards = CHANCE_CARDS.filter((c) => c.deck === deckType);
        const cardIndex = cardCounterRef.current % cards.length;
        cardCounterRef.current += 1;
        setActiveChanceCard(cards[cardIndex]);
        break;
      }

      case 'go_to_jail':
        showToast(`⚠️ Grid Collapse Alert! ${activePlayer.name} routed to Curtailment Bay for 2 turns.`);
        SoundManager.playWindWhoosh();
        setPlayers((prev) =>
          prev.map((p, i) =>
            i === activePlayerIndex ? { ...p, position: 10, inCurtailmentTurns: 2 } : p
          )
        );
        setTimeout(() => handleNextTurn(), 1600);
        break;

      case 'tax': {
        const fee = space.price || 100;
        showToast(`${activePlayer.name} paid $${fee}M for ${space.name}.`);
        setPlayers((prev) =>
          prev.map((p, i) =>
            i === activePlayerIndex ? { ...p, money: Math.max(0, p.money - fee) } : p
          )
        );
        setTimeout(() => handleNextTurn(), 1600);
        break;
      }

      case 'free_parking':
        showToast(`${activePlayer.name} reached the Microgrid Oasis! Battery reserves stabilized.`);
        SoundManager.playSuccessChime();
        setTimeout(() => handleNextTurn(), 1500);
        break;

      case 'go':
      case 'jail':
      default:
        setTimeout(() => handleNextTurn(), 1500);
        break;
    }
  };

  const handleBuyProperty = (deed: PropertyDeed) => {
    if (!deed.price || activePlayer.money < deed.price) return;
    const cost = deed.price;

    setPlayers((prev) =>
      prev.map((p, i) =>
        i === activePlayerIndex
          ? {
              ...p,
              money: p.money - cost,
              propertiesOwned: [...p.propertiesOwned, deed.id],
              upgradesBySpace: { ...p.upgradesBySpace, [deed.id]: 0 },
            }
          : p
      )
    );

    showToast(`${activePlayer.name} acquired ${deed.name} for $${cost}M!`);
    setInspectingDeed(null);
    handleNextTurn();
  };

  const handleUpgradeProperty = (deed: PropertyDeed) => {
    const cost = deed.upgradeCost || 100;
    if (activePlayer.money < cost) return;

    const currentLevel = activePlayer.upgradesBySpace[deed.id] || 0;
    const nextLevel = Math.min(5, currentLevel + 1);

    setPlayers((prev) =>
      prev.map((p, i) =>
        i === activePlayerIndex
          ? {
              ...p,
              money: p.money - cost,
              upgradesBySpace: { ...p.upgradesBySpace, [deed.id]: nextLevel },
            }
          : p
      )
    );

    showToast(
      `${activePlayer.name} upgraded ${deed.name} to ${
        nextLevel === 5 ? 'Clean Microgrid Hub' : `Tier ${nextLevel}`
      }!`
    );
    setInspectingDeed(null);
    handleNextTurn();
  };

  const handlePayRent = (amount: number, deed: PropertyDeed) => {
    const owner = players.find((p) => p.propertiesOwned.includes(deed.id));
    if (!owner) {
      setInspectingDeed(null);
      handleNextTurn();
      return;
    }

    const adjustedRent = calculateWeatherAdjustedRent(amount, currentWeather, deed.group);

    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id === activePlayer.id) {
          return { ...p, money: Math.max(0, p.money - adjustedRent) };
        }
        if (p.id === owner.id) {
          return { ...p, money: p.money + adjustedRent };
        }
        return p;
      })
    );

    showToast(`${activePlayer.name} paid $${adjustedRent}M feed-in grid fee to ${owner.name} for ${deed.name}.`);
    setInspectingDeed(null);
    handleNextTurn();
  };

  const handleApplyChanceCard = (moneyDelta: number, bonusReward: number, moveToSpaceId?: number) => {
    const netGain = moneyDelta + bonusReward;

    setPlayers((prev) =>
      prev.map((p, i) => {
        if (i !== activePlayerIndex) return p;
        const newPos = moveToSpaceId !== undefined ? moveToSpaceId : p.position;
        return {
          ...p,
          money: Math.max(0, p.money + netGain),
          position: newPos,
        };
      })
    );

    if (netGain > 0) {
      showToast(`${activePlayer.name} collected +$${netGain}M from clean dispatch!`);
    } else {
      showToast(`${activePlayer.name} paid $${Math.abs(netGain)}M in grid compliance costs.`);
    }

    setActiveChanceCard(null);
    setTimeout(() => handleNextTurn(), 1400);
  };

  const handleExecuteTrade = (
    giveSpaceId: number | null,
    giveCash: number,
    getSpaceId: number | null,
    getCash: number,
    negotiationText?: string
  ) => {
    const otherIndex = (activePlayerIndex + 1) % players.length;

    setPlayers((prev) => {
      return prev.map((p, i) => {
        if (i === activePlayerIndex) {
          let updatedOwned = p.propertiesOwned.filter((id) => id !== giveSpaceId);
          if (getSpaceId !== null) updatedOwned.push(getSpaceId);
          return {
            ...p,
            money: p.money - giveCash + getCash,
            propertiesOwned: updatedOwned,
          };
        } else if (i === otherIndex) {
          let updatedOwned = p.propertiesOwned.filter((id) => id !== getSpaceId);
          if (giveSpaceId !== null) updatedOwned.push(giveSpaceId);
          return {
            ...p,
            money: p.money + giveCash - getCash,
            propertiesOwned: updatedOwned,
          };
        }
        return p;
      });
    });

    showToast(`Trade concluded! Agreement executed.`);
    SoundManager.playSuccessChime();
  };

  const handleNextTurn = () => {
    const nextIdx = (activePlayerIndex + 1) % players.length;
    const nextPlayer = players[nextIdx];
    const nextRound = nextIdx === 0 ? roundNumber + 1 : roundNumber;

    setActivePlayerIndex(nextIdx);
    setRoundNumber(nextRound);
    setCanRoll(true);

    handleTurnWeatherAdvance();

    setWalkthroughStep(1);
    setWalkthroughInstruction(`Step 1: Turn handed to ${nextPlayer.name}. Roll dice!`);

    showToast(`Turn handed to ${nextPlayer.name}. Roll the dice!`);
  };

  const aiRef = useRef({
    handleRollComplete,
    handleBuyProperty,
    handlePayRent,
    handleNextTurn,
  });

  useEffect(() => {
    aiRef.current = {
      handleRollComplete,
      handleBuyProperty,
      handlePayRent,
      handleNextTurn,
    };
  });

  useEffect(() => {
    if (activePlayerIndex === 1 && canRoll) {
      const timer = setTimeout(() => {
        setToastMessage('Player 2 (AI) is rolling...');
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        aiRef.current.handleRollComplete(d1, d2);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [activePlayerIndex, canRoll]);

  useEffect(() => {
    if (activePlayerIndex === 1 && inspectingDeed) {
      const timer = setTimeout(() => {
        const owner = players.find((p) => p.propertiesOwned.includes(inspectingDeed.id));
        if (!owner && inspectingDeed.price && activePlayer.money >= inspectingDeed.price + 200) {
          aiRef.current.handleBuyProperty(inspectingDeed);
        } else if (owner && owner.id !== activePlayer.id) {
          const rent = Math.round((inspectingDeed.rent || 10) * currentWeather.tariffMultiplier);
          aiRef.current.handlePayRent(rent, inspectingDeed);
        } else {
          setInspectingDeed(null);
          aiRef.current.handleNextTurn();
        }
      }, 1400);

      return () => clearTimeout(timer);
    }
  }, [activePlayerIndex, inspectingDeed, activePlayer.id, activePlayer.money, currentWeather.tariffMultiplier, players]);

  const handleSaveCustomProfile = (updated: Partial<PlayerState>) => {
    setPlayers((prev) =>
      prev.map((p, i) => (i === 0 ? { ...p, ...updated } : p))
    );
    showToast(`Profile Updated for Player 1!`);
  };

  const handleResetGame = () => {
    setPlayers(INITIAL_PLAYERS);
    setActivePlayerIndex(0);
    setRoundNumber(1);
    setCurrentWeather(DYNAMIC_WEATHER_EVENTS.optimal_breeze);
    setWeatherDurationLeft(DYNAMIC_WEATHER_EVENTS.optimal_breeze.durationTurns);
    setCanRoll(true);
    setInspectingDeed(null);
    setActiveChanceCard(null);
    setWalkthroughStep(1);
    setWalkthroughInstruction('Step 1: Roll the 3D dice to advance.');
    hasCelebratedRef.current = false;
    showToast('Match reset. Player 1, roll to begin!');
  };

  const handleToggleSound = () => {
    setIsSoundMuted(!isSoundMuted);
    SoundManager.setMuted(!isSoundMuted);
  };

  const winner = players.find((p) => p.propertiesOwned.length >= 10 || p.money >= 4000);
  useEffect(() => {
    if (winner && !hasCelebratedRef.current) {
      hasCelebratedRef.current = true;
      SoundManager.playSuccessChime();
      try {
        confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
      } catch {
        // fallback
      }
    }
  }, [winner]);

  return (
    <div className="w-screen h-screen max-w-screen max-h-screen overflow-hidden bg-[#070c18] text-slate-100 grid place-items-center relative select-none font-sans p-0 m-0">
      {/* Watt-Pointer Custom Cursor */}
      <WattCursor />

      {/* DOCKED BOTTOM-LEFT: Step-by-Step Directions */}
      <div className="absolute bottom-2 sm:bottom-2.5 left-2 sm:left-2.5 z-30 hidden md:flex items-center gap-1.5 bg-slate-950/80 border border-slate-700/70 backdrop-blur-md px-2.5 py-1 rounded-xl text-xs max-w-sm shadow-md">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
        <span className="text-[10px] font-medium text-slate-200 truncate">
          {walkthroughInstruction}
        </span>
      </div>

      {/* DOCKED BOTTOM-RIGHT: Compact Tools (Trade, Weather, 3D, Timeline, Sound, Reset) */}
      <div className="absolute bottom-2 sm:bottom-2.5 right-2 sm:right-2.5 z-30 flex items-center gap-1 bg-slate-950/80 border border-slate-700/70 backdrop-blur-md p-1 rounded-xl shadow-md">
        <button
          type="button"
          onClick={() => setIsTradeOpen(true)}
          className="px-2 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition-all"
          title="Trade properties"
        >
          <Handshake className="w-3 h-3" />
          <span>Trade</span>
        </button>

        <button
          type="button"
          onClick={() => setIsWeatherOpen(true)}
          className="px-2 py-1 rounded-lg bg-teal-700 hover:bg-teal-600 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition-all"
          title="Atmospheric Weather System & Probabilities"
        >
          <CloudLightning className="w-3 h-3" />
          <span>Weather</span>
        </button>

        <button
          type="button"
          onClick={() => setIs3DViewerOpen(true)}
          className="px-2 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition-all"
          title="Inspect 3D Wind Turbine"
        >
          <Wind className="w-3 h-3" />
          <span>3D</span>
        </button>

        <button
          type="button"
          onClick={() => setIsTimelineOpen(true)}
          className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
          title="Energy History Timeline"
        >
          <History className="w-3 h-3" />
        </button>

        <button
          type="button"
          onClick={handleToggleSound}
          className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
          title={isSoundMuted ? 'Unmute' : 'Mute'}
        >
          {isSoundMuted ? <VolumeX className="w-3 h-3 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
        </button>

        <button
          type="button"
          onClick={handleResetGame}
          className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          title="Reset Match"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>

      {/* CLEAN ENERGY TYCOON COMMAND ARENA: Board framed by Empire Panels on Widescreen */}
      <div className="w-full h-full flex items-center justify-center gap-3 p-1.5 md:p-3 relative z-10 overflow-hidden">
        {/* Left Empire Panel (Player 1 Clean Energy Empire, MWh, CO2, Syllable Score) */}
        <LeftEmpirePanel
          player1={players[0]}
          activePlayerIndex={activePlayerIndex}
          onOpenCustomizer={() => setIsCompanyCustomizerOpen(true)}
        />

        {/* FULL VIEWPORT EXPANDED BOARD CONTAINER (Zero Header, Max Space) */}
        <main
          style={{
            width: 'min(98vw, calc(100vh - 12px))',
            height: 'min(98vw, calc(100vh - 12px))',
            maxWidth: 'min(98vw, calc(100vh - 12px))',
            maxHeight: 'min(98vw, calc(100vh - 12px))',
          }}
          className="aspect-square flex items-center justify-center relative z-10 m-auto shrink-0"
        >
          <MonopolyBoard
            players={players}
            activePlayerIndex={activePlayerIndex}
            weatherName={currentWeather.name}
            weatherSpeedMps={currentWeather.speedMps}
            weatherMultiplier={currentWeather.tariffMultiplier}
            weatherDurationTurns={weatherDurationLeft}
            onOpenWeatherModal={() => setIsWeatherOpen(true)}
            onOpenCustomizer={() => setIsCompanyCustomizerOpen(true)}
            onSpaceClick={(deed) => setInspectingDeed(deed)}
            onRollComplete={handleRollComplete}
            canRoll={canRoll && activePlayerIndex === 0}
            onDrawChance={(deck) => {
              const cards = CHANCE_CARDS.filter((c) => c.deck === deck);
              const cardIndex = cardCounterRef.current % cards.length;
              cardCounterRef.current += 1;
              setActiveChanceCard(cards[cardIndex]);
            }}
          />
        </main>

        {/* Right Empire Panel (Player 2 AI Empire, Atmospheric Station, Live Market News) */}
        <RightEmpirePanel
          player2={players[1]}
          activePlayerIndex={activePlayerIndex}
          currentWeather={currentWeather}
          weatherDurationTurns={weatherDurationLeft}
          onOpenWeatherModal={() => setIsWeatherOpen(true)}
          onSimulateShift={handleSimulateWeatherShift}
        />
      </div>

      {/* UNIFIED PROPERTY INSPECTOR & LINGUISTIC SHEET */}
      {inspectingDeed && activePlayerIndex === 0 && (
        <UnifiedPropertyInspector
          deed={inspectingDeed}
          ownerName={players.find((p) => p.propertiesOwned.includes(inspectingDeed.id))?.name || null}
          ownerColor={players.find((p) => p.propertiesOwned.includes(inspectingDeed.id))?.color}
          isCurrentPlayerOwner={activePlayer.propertiesOwned.includes(inspectingDeed.id)}
          canBuy={
            !players.some((p) => p.propertiesOwned.includes(inspectingDeed.id)) &&
            (inspectingDeed.price || 0) <= activePlayer.money
          }
          playerMoney={activePlayer.money}
          upgradesCount={activePlayer.upgradesBySpace[inspectingDeed.id] || 0}
          weatherMultiplier={currentWeather.tariffMultiplier}
          weatherName={currentWeather.name}
          onBuy={() => handleBuyProperty(inspectingDeed)}
          onUpgrade={() => handleUpgradeProperty(inspectingDeed)}
          onPayRent={(amt) => handlePayRent(amt, inspectingDeed)}
          onClose={() => {
            setInspectingDeed(null);
            handleNextTurn();
          }}
          onAwardBonus={(bonus) => {
            setPlayers((prev) =>
              prev.map((p, i) =>
                i === activePlayerIndex ? { ...p, money: p.money + bonus } : p
              )
            );
            showToast(`Terrific insight! +$${bonus}M Clean Energy Literacy Bonus.`);
          }}
        />
      )}

      {/* 3. Company & Avatar Customizer with Spelling Practice */}
      {isCompanyCustomizerOpen && (
        <CompanyCustomizerModal
          player={players[0]}
          onSave={handleSaveCustomProfile}
          onClose={() => setIsCompanyCustomizerOpen(false)}
        />
      )}

      {/* 4. Chance / Dispatch Cards */}
      {activeChanceCard && (
        <ChanceCardModal
          card={activeChanceCard}
          onApply={handleApplyChanceCard}
          onClose={() => setActiveChanceCard(null)}
        />
      )}

      {/* 5. Trade Negotiation Modal */}
      {isTradeOpen && (
        <TradeNegotiationModal
          currentPlayer={players[activePlayerIndex]}
          otherPlayer={players[(activePlayerIndex + 1) % players.length]}
          onExecuteTrade={handleExecuteTrade}
          onClose={() => setIsTradeOpen(false)}
        />
      )}

      {/* 6. 3D Turbine Cutaway Viewer */}
      {is3DViewerOpen && (
        <Turbine3DViewer onClose={() => setIs3DViewerOpen(false)} />
      )}

      {/* 7. Energy Timeline Mode */}
      {isTimelineOpen && (
        <EnergyTimelineModal onClose={() => setIsTimelineOpen(false)} />
      )}

      {/* 8. Dynamic Weather & Probabilities Modal */}
      {isWeatherOpen && (
        <WeatherModal
          currentWeather={currentWeather}
          durationTurnsLeft={weatherDurationLeft}
          onSimulateShift={handleSimulateWeatherShift}
          onClose={() => setIsWeatherOpen(false)}
        />
      )}
    </div>
  );
}
