
import ForerunnerDB from 'forerunnerdb';

import { default as DBG } from 'debug';
const debug = DBG('todos:fore');
const error = DBG('todos:error-fore');
import util from 'util';

import { Todo } from './Todo.mjs';

const _todo_fore  = Symbol('forerunnerdb');
const _todo_db    = Symbol('db');
const _todo_todos = Symbol('todos');

export class TodoStore {
    constructor() {
        this[_todo_fore] = undefined;
    }

    async connect() {
        if (this[_todo_fore]) return;

        this[_todo_fore] = new ForerunnerDB();
        this[_todo_db]   = this[_todo_fore].db('todo'); // TODO inject database name
        this[_todo_db].persist.dataDir('./TODOs');

        this[_todo_todos] = this[_todo_db].collection('todos');
        await new Promise((resolve, reject) => {
            this[_todo_todos].load(function (err) {
                if (!err) {
                    console.log('TODO successfully loaded TODOS collection');
                    resolve();
                } else {
                    reject(err);
                }
            })
        });
    }

    async close() {
        if (this[_todo_fore]) {
            await this.save();
            this[_todo_fore] = undefined;
            this[_todo_db] = undefined;
            this[_todo_todos] = undefined;
        }
    }

    async save() {
        await new Promise((resolve, reject) => {
            this[_todo_todos].save(function (err) {
                if (!err) {
                    console.log('TODO successfully saved TODOS collection');
                    resolve();
                } else {
                    reject(err);
                }
            })
        });
    }

    async getAll() {
        await this.connect();
        let todos = this[_todo_todos].find({}, {
            $orderBy: {
                precedence: 1
            }
        });
        let ret = todos.map(todo => {
            return (Todo.fromFORE(todo)).sanitized();
        });
        console.log(ret);
        return ret;
    }

    async create(todo) {
        await this.connect();
        this[_todo_todos].insert({
            title: todo.title, body: todo.body, precedence: todo.precedence
        });
        await this.save();
    }


    async update(todo) {
        await this.connect();
        this[_todo_todos].update({
            _id: todo.id
        }, {
            title: todo.title, body: todo.body, precedence: todo.precedence
        });
        await this.save();
    }

    async destroy(id) {
        await this.connect();
        this[_todo_todos].remove({
            _id: id
        });
        await this.save();
    }
}

