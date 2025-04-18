import Router from 'koa-router';
import anchorRouter from './anchor';
import orgAndUserRouter from './org-and-user';
import taskRouter from './task';
import tkGuildUserRouter from './tk-guild-user';

const clientRouter = new Router({ prefix: '/client' });

// tk guild user
clientRouter.use(
  tkGuildUserRouter.routes(),
  tkGuildUserRouter.allowedMethods(),
);

// org and user
clientRouter.use(orgAndUserRouter.routes(), orgAndUserRouter.allowedMethods());

// anchor
clientRouter.use(anchorRouter.routes(), anchorRouter.allowedMethods());

// task
clientRouter.use(taskRouter.routes(), taskRouter.allowedMethods());

export default clientRouter;
