import Router from 'koa-router';
import anchorRouter from './anchor';
import autoContactRouter from './auto-contact';
import mobileRouter from './mobile';
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

// mobile
clientRouter.use(mobileRouter.routes(), mobileRouter.allowedMethods());

// auto contact
clientRouter.use(
  autoContactRouter.routes(),
  autoContactRouter.allowedMethods(),
);

export default clientRouter;
