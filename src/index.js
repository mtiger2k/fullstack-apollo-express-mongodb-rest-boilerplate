import 'dotenv/config';
import cors from 'cors';
import morgan from 'morgan';
import http from 'http';
import jwt from 'jsonwebtoken';
import DataLoader from 'dataloader';
import express from 'express';
import bodyParser from 'body-parser';
import passport from 'passport';

import models, { connectDb } from './models';

import apolloServer from './apolloServer';
import api from './routes/api';
import rest from './routes/rest';

const configPassport = require('./config/passport');
configPassport(passport);

const app = express();

app.use(cors({
  exposedHeaders: 'X-Total-Count',
}));
app.use(bodyParser.json({limit:'50mb'}));
app.use(bodyParser.text({type: '*/xml'}));

app.use(morgan('dev'));

app.use('/api', api)
app.use('/', rest)

app.use('/graphql', passport.authenticate('jwt', {session: false}))
apolloServer.applyMiddleware({ app, path: '/graphql' });

const httpServer = http.createServer(app);
apolloServer.installSubscriptionHandlers(httpServer);

const isTest = !!process.env.TEST_DATABASE_URL;
const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 4000;

connectDb().then(async () => {
  if (isTest || isProduction) {
    // reset database
    await require('./initDb')();
  }

  httpServer.listen({ port }, () => {
    console.log(`Apollo Server on http://localhost:${port}/graphql`);
  });
});
