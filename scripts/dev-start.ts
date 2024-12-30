import type { ProjectConfig } from './utils';
import { join } from 'node:path';
import { LogColor, startProjects } from './utils';

/** Projects start order */
const projects: Array<ProjectConfig | Array<ProjectConfig>> = [
  {
    name: 'server',
    path: join(__dirname, '../apps/server'),
    command: 'pnpm dev',
    readySignal: />>>\s+server listen on/,
    logColor: LogColor.seafoam,
  },
];

startProjects(projects);
