
const _todo_id = Symbol('id');
const _todo_title = Symbol('title');
const _todo_body = Symbol('body');
const _todo_precedence = Symbol('priority');

export class Todo {
    constructor(id, title, body, precedence) {
        this[_todo_id] = id;
        this[_todo_title] = title;
        this[_todo_body] = body;
        this[_todo_precedence] = precedence;
    }

    get id() { return this[_todo_id]; }
    set id(newID) { this[_todo_id] = newID; }
    get title() { return this[_todo_title]; }
    set title(newTitle) { this[_todo_title] = newTitle; }
    get body() { return this[_todo_body]; }
    set body(newBody) { this[_todo_body] = newBody; }
    get precedence() { return this[_todo_precedence]; }
    set precedence(newPrecedence) { this[_todo_precedence] = newPrecedence; }

    sanitized() {
        return {
            id: this[_todo_id],
            title: this[_todo_title],
            body: this[_todo_body],
            precedence: this[_todo_precedence]
        }
    }

    static fromSQ(sqtodo) {
        return new Todo(sqtodo.id, sqtodo.title, sqtodo.body, sqtodo.precedence);
    }

    static fromFORE(sqtodo) {
        return new Todo(sqtodo._id, sqtodo.title, sqtodo.body, sqtodo.precedence);
    }
}
