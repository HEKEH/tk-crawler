// import { scheduleJob } from 'node-schedule';
// import { backupDatabase } from './backup';

// interface BackupSchedule {
//   type: 'full' | 'incremental';
//   cronExpression: string;
//   tables?: string[];
//   outputDir?: string;
// }

// const backupSchedules: BackupSchedule[] = [
//   {
//     type: 'full',
//     cronExpression: '0 0 * * *', // Daily at midnight
//     outputDir: './backups/daily',
//   },
//   {
//     type: 'incremental',
//     cronExpression: '0 */4 * * *', // Every 4 hours
//     tables: ['users', 'posts', 'comments'], // Example tables
//     outputDir: './backups/incremental',
//   },
// ];

// export function startScheduledBackups() {
//   console.log('Starting scheduled backups...');

//   backupSchedules.forEach(schedule => {
//     scheduleJob(schedule.cronExpression, async () => {
//       try {
//         console.log(`Running scheduled ${schedule.type} backup...`);
//         await backupDatabase({
//           type: schedule.type,
//           tables: schedule.tables,
//           outputDir: schedule.outputDir,
//           compress: true,
//         });
//         console.log(`Scheduled ${schedule.type} backup completed successfully`);
//       } catch (error) {
//         console.error(`Scheduled ${schedule.type} backup failed:`, error);
//       }
//     });

//     console.log(
//       `Scheduled ${schedule.type} backup with cron: ${schedule.cronExpression}`,
//     );
//   });
// }

// // Start the scheduled backups
// startScheduledBackups();
