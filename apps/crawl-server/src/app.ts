import http from 'node:http';
import { corsMiddleware } from '@tk-crawler/server-shared';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import config from './config';
import {
  addContextPropsMiddleware,
  requestWrapMiddleware,
} from './middlewares';
import router from './routes';

export default function initApp() {
  const app = new Koa();
  app.use(bodyParser()); // app.proxy = true;

  app.use(corsMiddleware(config.allowOrigin));

  app.use(addContextPropsMiddleware);
  app.use(requestWrapMiddleware);
  // use router
  app.use(router.routes());
  app.use(router.allowedMethods());

  const httpServer = http.createServer(app.callback());

  return httpServer;
}
