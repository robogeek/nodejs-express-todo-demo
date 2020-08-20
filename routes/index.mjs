import * as util from 'util';
import { default as express } from 'express';

export const router = express.Router();
import { io } from '../app.mjs';
import DBG from 'debug';
const debug = DBG('todos:home');
const error = DBG('todos:error-home');

import { getTODOs, createTODO } from '../models/sequlz.mjs';

router.get('/', async (req, res, next) => {
    try {
        res.render('index', {
            title: 'Todos',
            todos: await getTODOs()
        });
    } catch (err) {
        next(err);
    }
});


export function init() {
    io.of('/home').on('connect', socket => {
        debug('socketio connection on /home');


        socket.on('create-todo', async (newtodo, fn) => {
            try {
                debug(`socket create-todo ${util.inspect(newtodo)}`);
                await createTODO(newtodo);
                fn('ok');
            } catch (err) {
                error(`FAIL to create todo ${err.stack}`);
            }
        });
    });
}
