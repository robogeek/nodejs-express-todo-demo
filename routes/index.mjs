import * as util from 'util';
import { default as express } from 'express';

export const router = express.Router();
import { io } from '../app.mjs';
import DBG from 'debug';
const debug = DBG('todos:home');
const error = DBG('todos:error-home');

router.get('/', async (req, res, next) => {
    try {
        res.render('index', {
            title: 'Todos',
            todos: {}
        });
    } catch (err) {
        next(err);
    }
});


export function init() {
    io.of('/home').on('connect', socket => {
        debug('socketio connection on /home');
    });
}
