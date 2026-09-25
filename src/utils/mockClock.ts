// Configurable / Injectable Mock Clock for Deterministic Scenarios & Live Testing
// Allows switching between deterministic scenario fixture (e.g. 2026-09-20) and live system clock.

export type ClockMode = 'deterministic_scenario' | 'live_system';

export interface ClockState {
  mode: ClockMode;
  scenarioDate: string; // e.g. '2026-09-20'
  scenarioTime: string; // e.g. '10:30'
}

let currentClockState: ClockState = {
  mode: 'deterministic_scenario',
  scenarioDate: '2026-09-20',
  scenarioTime: '10:30'
};

const listeners = new Set<(state: ClockState) => void>();

export const getClockState = (): ClockState => ({ ...currentClockState });

export const setClockMode = (mode: ClockMode) => {
  currentClockState.mode = mode;
  listeners.forEach(cb => cb({ ...currentClockState }));
};

export const setScenarioDate = (date: string) => {
  currentClockState.scenarioDate = date;
  listeners.forEach(cb => cb({ ...currentClockState }));
};

export const subscribeClock = (cb: (state: ClockState) => void): (() => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};

export const getEffectiveDate = (): Date => {
  if (currentClockState.mode === 'live_system') {
    return new Date();
  }
  return new Date(`${currentClockState.scenarioDate}T${currentClockState.scenarioTime}:00`);
};

export const getEffectiveDateString = (): string => {
  if (currentClockState.mode === 'live_system') {
    return new Date().toISOString().split('T')[0];
  }
  return currentClockState.scenarioDate;
};

export const getEffectiveTimestamp = (): string => {
  if (currentClockState.mode === 'live_system') {
    const d = new Date();
    const dateStr = d.toISOString().split('T')[0];
    const timeStr = d.toTimeString().slice(0, 5);
    return `${dateStr} ${timeStr}`;
  }
  return `${currentClockState.scenarioDate} ${currentClockState.scenarioTime}`;
};

export const isDeterministicFixture = (): boolean => {
  return currentClockState.mode === 'deterministic_scenario';
};
