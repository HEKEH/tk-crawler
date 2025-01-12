import type { ProjectConfig } from './utils';
import { join } from 'node:path';
import { LogColor, startProjects } from './utils';

/** Projects start order */
const projects: Array<ProjectConfig | Array<ProjectConfig>> = [
  {
    name: 'pc-client',
    path: join(__dirname, '../apps/pc-client'),
    command: 'pnpm dev',
    readySignal: /Crawler start successfully/,
    logColor: LogColor.seafoam,
  },
];

startProjects(projects);
