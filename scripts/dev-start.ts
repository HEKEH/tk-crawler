import type { ProjectConfig } from '@tk-crawler/script-tools';
import { startProjects } from '@tk-crawler/script-tools';

/** Projects start order */
const projects: Array<ProjectConfig | Array<ProjectConfig>> = [
  // {
  //   name: 'pc-client',
  //   path: join(__dirname, '../apps/pc-client'),
  //   command: 'pnpm dev',
  //   readySignal: /Crawler start successfully/,
  //   logColor: LogColor.seafoam,
  // },
];

startProjects(projects);
