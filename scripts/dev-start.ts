import type { ProjectConfig } from './utils';
import { join } from 'node:path';
import { LogColor, startProjects } from './utils';

/** Projects start order */
const projects: Array<ProjectConfig | Array<ProjectConfig>> = [
  {
    name: 'crawler',
    path: join(__dirname, '../apps/crawler'),
    command: 'pnpm dev',
    readySignal: /Crawler start successfully/,
    logColor: LogColor.seafoam,
  },
];

startProjects(projects);
