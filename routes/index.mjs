import * as util from 'util';
import { default as express } from 'express';

export const router = express.Router();
import { io } from '../app.mjs';
import DBG from 'debug';
const debug = DBG('todos:home');
const error = DBG('todos:error-home');

import { getTODOs, createTODO, deleteTODO } from '../models/sequlz.mjs';

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
                fn(await getTODOs());
            } catch (err) {
                error(`FAIL to create todo ${err.stack}`);
            }
        });

        socket.on('get-todos', async (data, fn) => {
            try {
                fn(await getTODOs());
            } catch (err) {
                error(`FAIL to get todo ${err.stack}`);
            }
        } );

        socket.on('delete-todo', async (data) => {
            try {
                debug(`delete-todo ${util.inspect(data)}`);
                await deleteTODO(data.id);
                socket.emit('new-todos', await getTODOs());
            } catch (err) {
                error(`FAIL to delete todo ${err.stack}`);
            }
        } );
    });
}
