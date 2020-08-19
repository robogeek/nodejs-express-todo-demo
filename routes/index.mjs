import * as util from 'util';
import { default as express } from 'express';

export const router = express.Router();
import { io } from '../app.mjs';
import DBG from 'debug';
const debug = DBG('notes:home'); 
const error = DBG('notes:error-home'); 

/* GET home page. */
router.get('/', async (req, res, next) => {
    try {
        // console.log(util.inspect(notelist));
        res.render('index', {
            title: 'Notes',
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
