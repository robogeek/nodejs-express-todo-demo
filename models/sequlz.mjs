import { promises as fs } from 'fs';
import { default as jsyaml } from 'js-yaml';
import Sequelize from 'sequelize';

import { default as DBG } from 'debug';
const debug = DBG('todos:seqlz');
const error = DBG('todos:error-seqlz');
import util from 'util';

var sequlz;

export class SQTodo extends Sequelize.Model {}

export function dbHandle() {
    if (sequlz) return sequlz;
    return sequlz;
}

export async function connectDB() {
    if (typeof sequlz === 'undefined') {
        const yamltext = await fs.readFile(process.env.SEQUELIZE_CONNECT, 'utf8');
        const params = await jsyaml.safeLoad(yamltext, 'utf8');
        if (typeof process.env.SEQUELIZE_DBNAME !== 'undefined'
                && process.env.SEQUELIZE_DBNAME !== '') {
            params.dbname = process.env.SEQUELIZE_DBNAME;
        }
        if (typeof process.env.SEQUELIZE_DBUSER !== 'undefined'
                && process.env.SEQUELIZE_DBUSER !== '') {
            params.username = process.env.SEQUELIZE_DBUSER;
        }
        if (typeof process.env.SEQUELIZE_DBPASSWD !== 'undefined'
                && process.env.SEQUELIZE_DBPASSWD !== '') {
            params.password = process.env.SEQUELIZE_DBPASSWD;
        }
        if (typeof process.env.SEQUELIZE_DBHOST !== 'undefined'
                && process.env.SEQUELIZE_DBHOST !== '') {
            params.params.host = process.env.SEQUELIZE_DBHOST;
        }
        if (typeof process.env.SEQUELIZE_DBPORT !== 'undefined'
                && process.env.SEQUELIZE_DBPORT !== '') {
            params.params.port = process.env.SEQUELIZE_DBPORT;
        }
        if (typeof process.env.SEQUELIZE_DBDIALECT !== 'undefined'
                && process.env.SEQUELIZE_DBDIALECT !== '') {
            params.params.dialect = process.env.SEQUELIZE_DBDIALECT;
        }
        debug(`connectDB ${util.inspect(params)}`);
        sequlz = new Sequelize(params.dbname,
                        params.username, params.password,
                        params.params);
        debug(`connectDB connected`);
        await sequlz.authenticate();
        debug(`connectDB authenticated`);

        SQTodo.init({
            key: { type: Sequelize.DataTypes.STRING,
                primaryKey: true, unique: true },
            title: Sequelize.DataTypes.STRING,
            body: Sequelize.DataTypes.TEXT,
            precedence: Sequelize.DataTypes.INTEGER
        }, {
            sequelize: sequlz,
            modelName: 'SQTodo'
        });
        await SQTodo.sync();
    }
    return sequlz;
}

export async function close() {
    if (sequlz) sequlz.close();
    sequlz = undefined;
}

function sanitizedTodo(todo) {
    return {
        title: todo.title,
        body: todo.body,
        precedence: todo.precedence
    }
}

export async function getTODOs() {
    await connectDB();
    let todos = await SQTodo.findAll();
    return todos.map(todo => {
        return sanitizedTodo(todo);
    });
}

export async function createTODO(todo) {
    await connectDB();
    const newmsg = await SQTodo.create({
        title: todo.title, body: todo.body, precedence: todo.precedence
    });
}