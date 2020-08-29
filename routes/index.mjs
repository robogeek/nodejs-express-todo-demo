import * as util from 'util';
import { default as express } from 'express';

export const router = express.Router();
import { io } from '../app.mjs';
import DBG from 'debug';
const debug = DBG('todos:home');
const error = DBG('todos:error-home');

import { Todo } from '../models/Todo.mjs';

router.get('/', async (req, res, next) => {
    try {
        res.render('index', {
            title: 'Todos'
        });
    } catch (err) {
        next(err);
    }
});


export function init(todostore) {
    io.of('/home').on('connect', socket => {
        debug('socketio connection on /home');

        socket.on('get-todos', async (data, fn) => {
            try {
                fn(await todostore.getAll());
            } catch (err) {
                error(`FAIL to get todo ${err.stack}`);
            }
        } );

        socket.on('create-todo', async (newtodo, fn) => {
            try {
                debug(`socket create-todo ${util.inspect(newtodo)}`);
                await todostore.create(
                    new Todo(-1, newtodo.title, newtodo.body, newtodo.precedence)
                );
                fn('ok');
                let newtodos = await todostore.getAll();
                debug('after create new-todos ', newtodos)
                io.of('/home').emit('new-todos', newtodos);
            } catch (err) {
                error(`FAIL to create todo ${err.stack}`);
            }
        });

        socket.on('edit-todo', async (newtodo, fn) => {
            try {
                debug(`socket edit-todo ${util.inspect(newtodo)}`);
                await todostore.update(
                    new Todo(newtodo.id, newtodo.title,
                            newtodo.body, newtodo.precedence)
                );
                fn('ok');
                let newtodos = await todostore.getAll();
                debug('after edit new-todos ', newtodos)
                io.of('/home').emit('new-todos', newtodos);
            } catch (err) {
                error(`FAIL to create todo ${err.stack}`);
            }
        });

        socket.on('delete-todo', async (data) => {
            try {
                debug(`delete-todo ${util.inspect(data)}`);
                await todostore.destroy(data.id);
                let newtodos = await todostore.getAll();
                debug('after delete new-todos ', newtodos)
                io.of('/home').emit('new-todos', newtodos);
            } catch (err) {
                error(`FAIL to delete todo ${err.stack}`);
            }
        } );
    });
}
