// Dynamic Weather Engine for Windopoly: Clean Energy Empire
// Implements probabilistic atmospheric events, turn-based durations, and energy grid mechanics.

export type WeatherId =
  | 'optimal_breeze'
  | 'strong_winds'
  | 'calm_period'
  | 'storm'
  | 'icing';

export interface DynamicWeatherEvent {
  id: WeatherId;
  name: string;
  speedMps: number; // meters per second
  beaufortScale: string;
  probability: number; // Percentage (sum to 100)
  durationTurns: number; // How many turns this front persists
  tariffMultiplier: number; // Revenue multiplier for wind generation
  maintenanceCostPerProperty: number; // $M charged when event strikes
  isFarmShutdown: boolean; // Cut-out speed reached; turbines locked
  badgeColor: string;
  headline: string;
  summary: string;
  plainEnglishExplanation: string;
  pedagogicalTerms: {
    term: string;
    phonetic: string;
    definition: string;
    example: string;
  }[];
}

export const DYNAMIC_WEATHER_EVENTS: Record<WeatherId, DynamicWeatherEvent> = {
  optimal_breeze: {
    id: 'optimal_breeze',
    name: 'Optimal Wind Breeze',
    speedMps: 11.5,
    beaufortScale: 'Force 6 (Strong Breeze)',
    probability: 35,
    durationTurns: 3,
    tariffMultiplier: 1.0,
    maintenanceCostPerProperty: 0,
    isFarmShutdown: false,
    badgeColor: 'emerald',
    headline: 'Steady 11.5 m/s laminar airflow across all corridors.',
    summary: 'Standard 100% rated generation. Turbines operate smoothly at peak aerodynamic efficiency with zero mechanical fatigue.',
    plainEnglishExplanation: 'The wind speed is ideal for turbines. They produce steady, dependable electricity without any danger of overloading the grid.',
    pedagogicalTerms: [
      {
        term: 'Rated Capacity',
        phonetic: '/ˈreɪ.tɪd kəˈpæs.ə.ti/',
        definition: 'The maximum power output an electrical generator is engineered to produce continuously.',
        example: 'At 11.5 m/s, the coastal wind farm operates at its full 500-megawatt rated capacity.',
      },
      {
        term: 'Laminar Flow',
        phonetic: '/ˈlæm.ɪ.nər floʊ/',
        definition: 'Smooth, parallel airflow with minimal turbulence or air-packet resistance.',
        example: 'Offshore turbines benefit from laminar flow because open ocean waters lack friction from trees or hills.',
      },
    ],
  },
  strong_winds: {
    id: 'strong_winds',
    name: 'Strong Winds (Power Surge)',
    speedMps: 20.5,
    beaufortScale: 'Force 8 (Fresh Gale)',
    probability: 25,
    durationTurns: 2,
    tariffMultiplier: 1.5,
    maintenanceCostPerProperty: 0,
    isFarmShutdown: false,
    badgeColor: 'amber',
    headline: 'High-velocity atmospheric front surges feed-in tariffs by +50%!',
    summary: 'High kinetic density sweeps over mountain ridges and sea corridors. Turbines deliver massive surges of clean megawatts into interconnectors.',
    plainEnglishExplanation: 'Powerful winds give the turbine blades extra pushing force, creating 50% more electricity and boosting rental revenues!',
    pedagogicalTerms: [
      {
        term: 'Kinetic Density',
        phonetic: '/kɪˈnet̬.ɪk ˈden.sə.ti/',
        definition: 'The volume of moving physical energy contained within a cubic meter of blowing air.',
        example: 'Wind power increases with the cube of wind speed, so double the velocity yields eightfold kinetic density.',
      },
      {
        term: 'Aerodynamic Lift',
        phonetic: '/ˌer.oʊ.daɪˈnæm.ɪk lɪft/',
        definition: 'The upward perpendicular force created as wind streams faster over the curved surface of a turbine blade.',
        example: 'Strong winds create intense aerodynamic lift, causing the rotor hub to spin at rapid RPM.',
      },
    ],
  },
  calm_period: {
    id: 'calm_period',
    name: 'Calm Period (Wind Drought)',
    speedMps: 3.2,
    beaufortScale: 'Force 2 (Light Breeze)',
    probability: 20,
    durationTurns: 2,
    tariffMultiplier: 0.5,
    maintenanceCostPerProperty: 0,
    isFarmShutdown: false,
    badgeColor: 'sky',
    headline: 'Thermal calm drops wind output by 50%. Solar & batteries take priority.',
    summary: 'Air velocity falls near the cut-in speed limit (3 m/s). Generators idle or produce low output. Energy traders rely on battery storage and solar arrays.',
    plainEnglishExplanation: 'The air is unusually quiet. Because there is little breeze, wind farms produce half their normal energy, highlighting the need for storage batteries.',
    pedagogicalTerms: [
      {
        term: 'Cut-In Speed',
        phonetic: '/kʌt ɪn spiːd/',
        definition: 'The minimum wind velocity (typically 3 to 4 m/s) required for blades to begin rotating and generating net electricity.',
        example: 'During a calm period, air velocity dips below cut-in speed, so turbines feather their blades and idle.',
      },
      {
        term: 'Baseload Reserve',
        phonetic: '/ˈbeɪs.loʊd rɪˈzɜːrv/',
        definition: 'Continuous, reliable electrical power held ready to satisfy minimum uninterrupted grid consumer demand.',
        example: 'Grid operators dispatch baseload reserves from pumped hydro and battery banks when the wind dies down.',
      },
    ],
  },
  storm: {
    id: 'storm',
    name: 'Severe Gale Storm (Cut-Out Shutdown)',
    speedMps: 28.5,
    beaufortScale: 'Force 10 (Violent Storm)',
    probability: 15,
    durationTurns: 2,
    tariffMultiplier: 0.2,
    maintenanceCostPerProperty: 25,
    isFarmShutdown: true,
    badgeColor: 'rose',
    headline: 'Extreme winds exceed cut-out threshold (>25 m/s)! Turbines shut down for structural safety.',
    summary: 'Emergency disc brakes engage and rotor blades pitch parallel to the gale. Wind generation is throttled to 20%, and all wind farm owners incur a $25M inspection maintenance levy!',
    plainEnglishExplanation: 'The storm is too violent! Turbines must automatically lock their brakes to prevent structural damage. Owners must pay maintenance fees to inspect blades.',
    pedagogicalTerms: [
      {
        term: 'Cut-Out Speed',
        phonetic: '/kʌt aʊt spiːd/',
        definition: 'The maximum allowable wind speed (around 25 m/s) at which a turbine shuts down to prevent catastrophic mechanical failure.',
        example: 'When gusts topped 28 m/s, automated sensors triggered cut-out speed protocols to protect the generator.',
      },
      {
        term: 'Blade Pitch Control',
        phonetic: '/bleɪd pɪtʃ kənˈtroʊl/',
        definition: 'The mechanical rotation of turbine blades along their longitudinal axis to regulate lift and reduce strain.',
        example: 'During violent storms, blade pitch control turns the blade edge directly into the wind to stall rotation.',
      },
    ],
  },
  icing: {
    id: 'icing',
    name: 'Icing Conditions (Blade Heating)',
    speedMps: 7.0,
    beaufortScale: 'Force 4 (Moderate Breeze)',
    probability: 5,
    durationTurns: 1,
    tariffMultiplier: 0.7,
    maintenanceCostPerProperty: 15,
    isFarmShutdown: false,
    badgeColor: 'indigo',
    headline: 'Sub-zero freezing drizzle forms ice on blade airfoils. Electro-thermal heating engaged.',
    summary: 'Rime ice alters blade aerodynamic curvature, creating drag. Electro-thermal carbon mats inside blades activate, consuming auxiliary power ($15M maintenance fee).',
    plainEnglishExplanation: 'Cold fog causes ice to freeze onto the blades. This disrupts the air flow and requires electric heaters to melt the frost.',
    pedagogicalTerms: [
      {
        term: 'Aerodynamic Drag',
        phonetic: '/ˌer.oʊ.daɪˈnæm.ɪk dræɡ/',
        definition: 'The mechanical resistance or friction force exerted by air moving against a physical body.',
        example: 'Ice accumulation on the blade edge increases aerodynamic drag and cuts power efficiency by 30%.',
      },
      {
        term: 'De-Icing System',
        phonetic: '/diː ˈaɪ.sɪŋ ˈsɪs.təm/',
        definition: 'Thermal or mechanical equipment designed to melt or shed ice formations from sensitive components.',
        example: 'Modern offshore turbines use carbon-fiber de-icing systems embedded directly inside the fiberglass shell.',
      },
    ],
  },
};

/**
 * Randomly pick a new dynamic weather event based on defined probabilities
 */
export function rollDynamicWeather(excludeId?: WeatherId): DynamicWeatherEvent {
  const weatherList = Object.values(DYNAMIC_WEATHER_EVENTS).filter(
    (w) => !excludeId || w.id !== excludeId
  );

  const totalWeight = weatherList.reduce((sum, w) => sum + w.probability, 0);
  let randomVal = Math.random() * totalWeight;

  for (const weather of weatherList) {
    if (randomVal < weather.probability) {
      return weather;
    }
    randomVal -= weather.probability;
  }

  return DYNAMIC_WEATHER_EVENTS.optimal_breeze;
}

/**
 * Calculate weather-adjusted tariff/rent based on property type and active weather condition
 */
export function calculateWeatherAdjustedRent(
  baseRent: number,
  weather: DynamicWeatherEvent,
  group: string
): number {
  if (group === 'light_blue') {
    // Solar: unaffected by storms, thrives in calm clear periods
    return weather.id === 'calm_period' ? Math.round(baseRent * 1.3) : baseRent;
  }
  if (group === 'utility') {
    // Storage & Substation: highly lucrative during storms & calm periods when arbitrage is vital
    if (weather.id === 'storm' || weather.id === 'calm_period') {
      return Math.round(baseRent * 1.4);
    }
    return baseRent;
  }

  // Wind and offshore properties follow the weather tariff multiplier
  return Math.max(1, Math.round(baseRent * weather.tariffMultiplier));
}
