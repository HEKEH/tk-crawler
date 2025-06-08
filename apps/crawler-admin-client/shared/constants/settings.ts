import type { Settings } from '../types';

const CommonDefaultSettings: Omit<Settings, 'write_log'> = {
  error_sound_time: [10, 24],
};

export function getDefaultSettings({
  defaultWriteLog,
}: {
  defaultWriteLog: boolean;
}): Settings {
  return {
    ...CommonDefaultSettings,
    write_log: defaultWriteLog,
  };
}
