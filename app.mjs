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
import { connectDB } from './models/sequlz.mjs';

import socketio from 'socket.io';

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

export const io = socketio(server);

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

await connectDB();
await homeInit();
