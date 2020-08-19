
const _note_title = Symbol('title');
const _note_body = Symbol('body');
const _note_priority = Symbol('priority');

export class Todo {
    constructor(title, body, priority) {
        this[_note_title] = title; 
        this[_note_body] = body; 
        this[_note_priority] = priority; 
    }

    get title() { return this[_note_title]; }
    set title(newTitle) { this[_note_title] = newTitle; }
    get body() { return this[_note_body]; }
    set body(newBody) { this[_note_body] = newBody; }
    get priority() { return this[_note_priority]; }
    set priority(newPriority) { this[_note_priority] = newPriority; }
}
