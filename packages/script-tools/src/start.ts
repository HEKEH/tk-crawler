import type { SpawnOptions } from 'node:child_process';
import { spawn } from 'node:child_process';
import process from 'node:process';

import { log, LogColor, logError } from './log';

const runningChildProcesses: ReturnType<typeof spawn>[] = [];

/** execute command and wait for ready signal */
export function executeCommand(project: ProjectConfig): Promise<void> {
  return new Promise((resolve, reject) => {
    const { logColor: color, name: projectName } = project;
    log({ color, message: `Starting ${projectName}...` });

    const [cmd, ...args] = project.command.split(' ');
    const options: SpawnOptions = {
      cwd: project.path,
      shell: true,
    };

    const childProcess = spawn(cmd, args, options);
    runningChildProcesses.push(childProcess);

    let resolved = false;
    // Handle process output
    childProcess.stdout?.on('data', async data => {
      const output = data.toString().trim();
      log({ color, projectName, message: output });

      // Check for ready signal in output
      if (
        project.readySignal &&
        !resolved &&
        (typeof project.readySignal === 'string'
          ? output.includes(project.readySignal)
          : project.readySignal.test(output))
      ) {
        log({ color, projectName, message: 'is ready' });
        resolved = true;
        resolve();
      }
    });

    childProcess.stderr?.on('data', data => {
      logError({
        color,
        projectName,
        message: data.toString().trim(),
      });
    });

    childProcess.on('error', error => {
      logError({
        color,
        projectName,
        message: error,
      });
      reject(error);
    });

    childProcess.on('exit', code => {
      if (code !== 0) {
        reject(new Error(`${project.name} exited with code ${code}`));
      }
    });
    if (!project.readySignal) {
      resolve();
    }
  });
}

export function killAllChildProcesses() {
  runningChildProcesses.forEach(_process => {
    _process.kill();
  });
}

type ReadySignal = string | RegExp;

export interface ProjectConfig {
  name: string;
  path: string;
  command: string;
  readySignal?: ReadySignal;
  logColor: LogColor;
}

/** start projects sequentially */
export async function startProjects(
  projects: Array<ProjectConfig | ProjectConfig[]>,
) {
  // add listener for Ctrl+C
  process.on('SIGINT', () => {
    log({
      color: LogColor.red,
      message: '\nReceived SIGINT. Shutting down all processes...',
    });
    killAllChildProcesses();
    process.exit(0);
  });
  try {
    for (const project of projects) {
      if (Array.isArray(project)) {
        // start projects in parallel
        await Promise.all(project.map(p => executeCommand(p)));
      } else {
        await executeCommand(project);
      }
    }
    log({
      color: LogColor.blue,
      message: 'All projects started successfully!',
    });
  } catch (error) {
    logError({
      message: 'Failed to start projects:',
    });
    logError({
      message: error,
    });
    killAllChildProcesses();
    process.exit(1);
  }
}
