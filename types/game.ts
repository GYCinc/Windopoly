export type TileType = 
  | 'start' 
  | 'wind_farm' 
  | 'grid_infrastructure' 
  | 'storage' 
  | 'weather_event' 
  | 'dispatch_notice' 
  | 'boardroom_dialogue' 
  | 'curtailment_bay' 
  | 'variable_maintenance' 
  | 'environmental_audit';

export type PropertyGroup = 
  | 'valley_wind' 
  | 'ridge_wind' 
  | 'coastal_wind' 
  | 'offshore_deep' 
  | 'floating_mega' 
  | 'hvdc_grid' 
  | 'storage_hub';

export interface VocabWord {
  id: string;
  word: string;
  phonetic: string;
  syllables: string;
  partOfSpeech: 'noun' | 'verb' | 'adjective';
  cefrLevel: 'A2' | 'B1' | 'B2' | 'C1';
  simpleDefinition: string;
  energyContext: string;
  exampleSentence: string;
  businessTip: string;
}

export interface BoardTile {
  id: number;
  name: string;
  type: TileType;
  group?: PropertyGroup;
  cost?: number; // in Millions ($M)
  baseRent?: number; // Base feed-in tariff / rent in $M
  rentWithUpgrades?: number[]; // [1 upgrade, 2 upgrades, 3 upgrades, 4 upgrades]
  upgradeCost?: number; // Cost to install smart sensors, battery pack, etc.
  baseOutputMWh: number; // Base generation in Megawatt Hours
  maintenanceCost: number; // Regular baseline maintenance per turn ($M)
  description: string;
  associatedVocab?: string[]; // IDs of vocab words
  ownerId?: string | null;
  upgradesCount?: number; // 0 to 4
  accentColor?: string;
  iconName?: string;
}

export type WeatherType = 
  | 'optimal_breeze' 
  | 'gale_storm' 
  | 'calm_doldrums' 
  | 'arctic_frost' 
  | 'heatwave_peak';

export interface WeatherCondition {
  id: WeatherType;
  name: string;
  icon: string;
  windSpeedMps: number; // meters per second
  outputMultiplier: number; // e.g. 1.0 = 100%, 1.6 = 160%, 0.35 = 35%
  maintenanceMultiplier: number; // e.g. 1.5 = 50% extra wear
  summary: string;
  plainEnglishExplanation: string;
  vocabs: string[];
}

export interface Player {
  id: string;
  name: string;
  roleTitle: string;
  avatar: string;
  color: string;
  isAi: boolean;
  money: number; // in $M (Millions USD)
  position: number; // 0 to 23
  curtailedTurnsLeft: number; // If in curtailment station
  propertiesOwned: number[]; // Tile IDs
  totalMWhGenerated: number;
  masteredVocabIds: string[];
  vocabularyPracticeScore: number;
}

export interface DispatchNoticeCard {
  id: string;
  title: string;
  category: 'policy' | 'market' | 'engineering' | 'climate';
  headline: string;
  scenarioText: string;
  keyTerm: string;
  moneyEffect: number; // +/- $M
  energyEffectMWh?: number;
  englishQuestion?: {
    prompt: string;
    options: {
      text: string;
      isCorrect: boolean;
      feedback: string;
    }[];
    reward: number;
  };
}

export interface BoardroomOption {
  text: string;
  tone: 'professional' | 'too_casual' | 'confrontational';
  explanation: string;
  moneyReward: number;
  reputationGain: number;
  englishFeedback: string;
}

export interface BoardroomScenario {
  id: string;
  title: string;
  counterpart: string;
  counterpartRole: string;
  context: string;
  challengePrompt: string;
  targetSkill: string;
  options: BoardroomOption[];
}

export interface TurnLog {
  id: string;
  turnNumber: number;
  playerName: string;
  action: string;
  highlightVocab?: string;
  timestamp: string;
}
