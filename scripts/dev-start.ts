import type { ProjectConfig } from './utils';
import { join } from 'node:path';
import { LogColor, startProjects } from './utils';

/** Projects start order */
const projects: Array<ProjectConfig | Array<ProjectConfig>> = [
  {
    name: 'el-popover',
    path: join(__dirname, '../packages/el-popover'),
    command: 'pnpm dev',
    readySignal: /^built in \d+ms\.$/,
    logColor: LogColor.seafoam,
  },
  {
    name: '@el-popover/demo',
    path: join(__dirname, '../packages/demo'),
    command: 'pnpm dev',
    readySignal: /Local:\s+http:\/\/localhost:\d+\//,
    logColor: LogColor.mint,
  },
];

startProjects(projects);
