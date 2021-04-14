import { default as express } from 'express';
import { default as DBG } from 'debug';
const debug = DBG('todos:debug');
const dbgerror = DBG('todos:error');
import { default as logger } from 'morgan';
import { default as cookieParser } from 'cookie-parser';
import { default as bodyParser } from 'body-parser';
import helmet from 'helmet';
import * as http from 'http';
import * as path from 'path';
import * as util from 'util';
import { default as nunjucks } from 'nunjucks';
import { approotdir } from './approotdir.mjs';
const __dirname = approotdir;
import {
    normalizePort, onError, onListening, handle404, basicErrorHandler
} from './appsupport.mjs';

import { 
    router as indexRouter,
    init as homeInit
} from './routes/index.mjs';
import { TodoStore } from './models/forerunner.mjs';


import session from 'express-session';
import ConnectRedis from 'connect-redis';
import redis from 'redis';
import sessionLokiStore from 'connect-loki';
import sessionMemoryStore from 'memorystore';

var sessionStore; // This will be referred to later

if (typeof process.env.REDIS_ENDPOINT !== 'undefined'
 && process.env.REDIS_ENDPOINT !== '') {
    const RedisStore = ConnectRedis(session);

    let redisParams = { 
        port: 6379,
        host: process.env.REDIS_ENDPOINT,
        // no_ready_check: true
    };
    if (typeof process.env.REDIS_PASSWD !== 'undefined'
            && process.env.REDIS_PASSWD !== '') {
        redisParams.password  = process.env.REDIS_PASSWD;
        redisParams.auth_pass = process.env.REDIS_PASSWD;
    }
    console.log(`Redis SessionStore redisParams ${util.inspect(redisParams)}`);
    sessionStore = new RedisStore({ client: redis.createClient(redisParams) });
} else if (typeof process.env.SESSION_PATH !== 'undefined'
            && process.env.SESSION_PATH !== '') {
    const LokiStore = sessionLokiStore(session);
    sessionStore = new LokiStore({ path: process.env.SESSION_PATH });
} else {
    const MemoryStore = sessionMemoryStore(session);
    sessionStore = new MemoryStore({});
}

export const sessionCookieName = 'todocookie.sid';
const sessionSecret = 'keyboard squirrel'; 

import socketio from 'socket.io';
import sharedSocketIOSession from 'express-socket.io-session';
import redisIO from 'socket.io-redis';

export const app = express();

export const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

export const server = http.createServer(app);

server.listen(port);
server.on('request', (req, res) => {
    debug(`${new Date().toISOString()} request ${req.method} ${req.url}`);
});
server.on('error', onError);
server.on('listening', onListening);

export const io = socketio(server, {
    pingTimeout: 180000,
    pingInterval: 25000
});

nunjucks.configure('views', {
    autoescape: true,
    express: app
});
app.set('view engine', 'njk')

app.use(logger(process.env.REQUEST_LOG_FORMAT || 'dev', {
    // immediate: true,
}));
// app.use(helmet());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
// Use this for both Socket.io and ExpressJS sessions
const sessionMiddleware = session({
    store: sessionStore,
    secret: sessionSecret,
    resave: true,
    saveUninitialized: true,
    name: sessionCookieName
});

if (typeof process.env.REDIS_ENDPOINT !== 'undefined'
 && process.env.REDIS_ENDPOINT !== '') {
    const ioSession = sharedSocketIOSession(sessionMiddleware, {
        autoSave: true
    });
    io.use(ioSession);
    io.of('/home').use(ioSession);
}
app.use(sessionMiddleware);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/assets/vendor/bootstrap/js', express.static(
    path.join(__dirname, 'node_modules', 'bootstrap', 'dist', 'js')));
app.use('/assets/vendor/bootstrap/css', express.static(
    path.join(__dirname, 'node_modules', 'bootstrap', 'dist', 'css')));
app.use('/assets/vendor/bootstrap/icons', express.static(
    path.join(__dirname, 'node_modules', 'bootstrap-icons', 'icons')));
app.use('/assets/vendor/nunjucks', express.static(
    path.join(__dirname, 'node_modules', 'nunjucks', 'browser')));

app.use('/assets/vendor/popper.js', express.static(
    path.join(__dirname, 'node_modules', 'popper.js', 'dist', 'umd')));

// Router function lists
app.use('/', indexRouter);

// error handlers
// catch 404 and forward to error handler
app.use(handle404);
app.use(basicErrorHandler);


if (typeof process.env.REDIS_ENDPOINT !== 'undefined'
 && process.env.REDIS_ENDPOINT !== '') {
    let adapter;
    const options = {
        port: 6379,
        host: process.env.REDIS_ENDPOINT,
    };
    if (typeof process.env.REDIS_PASSWD !== 'undefined'
            && process.env.REDIS_PASSWD !== '') {
        options.password  = process.env.REDIS_PASSWD;
        options.auth_pass = process.env.REDIS_PASSWD;
        let redisParams = { 
            port: 6379,
            host: process.env.REDIS_ENDPOINT,
            password: process.env.REDIS_PASSWD,
            auth_pass: process.env.REDIS_PASSWD
        };
        options.pubClient = redis.createClient(redisParams);
        options.subClient = redis.createClient(redisParams);
    }
    console.log(`REDIS redisParams ${util.inspect(redisParams)}`);
    console.log(`REDIS options ${util.inspect(options)}`);
    adapter = redisIO(options);

    adapter.pubClient.on('connect', function() {
        console.log(`REDIS pubClient got connect`);
    });
    adapter.pubClient.on('ready', function() {
        console.log(`REDIS pubClient got ready`);
    });
    adapter.pubClient.on('error', function(error) {
        console.log(`REDIS pubClient got error`, error);
    });
    adapter.pubClient.on('close', function() {
        console.log(`REDIS pubClient got close`);
    });
    adapter.pubClient.on('reconnecting', function() {
        console.log(`REDIS pubClient got reconnecting`);
    });
    adapter.pubClient.on('end', function() {
        console.log(`REDIS pubClient got end`);
    });

    adapter.subClient.on('connect', function() {
        console.log(`REDIS subClient got connect`);
    });
    adapter.subClient.on('ready', function() {
        console.log(`REDIS subClient got ready`);
    });
    adapter.subClient.on('error', function(error) {
        console.log(`REDIS subClient got error`, error);
    });
    adapter.subClient.on('close', function() {
        console.log(`REDIS subClient got close`);
    });
    adapter.subClient.on('reconnecting', function() {
        console.log(`REDIS subClient got reconnecting`);
    });
    adapter.subClient.on('end', function() {
        console.log(`REDIS subClient got end`);
    });
    io.adapter(adapter);
}

// This approach does not work well if the database
// is not reachable for some reason.  With this approach
// we have one and only one chance to connect to the database.
// What if the database is a Docker container that has not
// finished initializing and is therefore not usable?
// If we instead allow the connect method to be called 
// multiple times, it can be tried and retried until the
// connect method succeeds.
// export const todostore = await TodoStore.connect();
// This approach allows us to implement the connect method
// in a different way.
export const todostore = new TodoStore();
await homeInit(todostore);

