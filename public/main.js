
document.addEventListener("DOMContentLoaded", function(){

    // See: https://stackoverflow.com/questions/3955229/remove-all-child-elements-of-a-dom-node-in-javascript
    function empty(id) {
        const parent = document.getElementById(id);
        while (parent.firstChild) {
            parent.firstChild.remove();
        }
    }

    function renderTODOS(todos) {
        empty("TODOlistGroup");
        let txt = '';
        for (let todo of todos) {
            console.log('render todo ', todo);
            txt += nunjucks.renderString(
            `
            <li class="list-group-item" id="todo{{ todo.id }}">
                <button type="button" class="btn todo-title"
                    data-toggle="collapse" data-target="#collapse{{ todo.id }}"
                    aria-expanded="false" aria-controls="collapse{{ todo.id }}"
                >{{ todo.title }}</button>
                <div class="float-right">
                
                {% if todo.precedence == 1 %}
                <span class="badge bg-success">Low</span>
                {% elseif todo.precedence == 2 %}
                <span class="badge bg-warning text-dark">Medium</span>
                {% elseif todo.precedence == 3 %}
                <span class="badge bg-danger">High</span>
                {% endif %}
                
                <button type="button" class="btn edit-button" data-id="{{ todo.id }}">
                    <img src="/assets/vendor/bootstrap/icons/pencil.svg" alt=""
                        width="32" height="32" title="Edit"
                        class="edit-button-image">
                </button>
                
                <button type="button" class="btn delete-button" data-id="{{ todo.id }}">
                   <img src="/assets/vendor/bootstrap/icons/trash.svg" alt=""
                        width="32" height="32" title="Delete"
                        class="delete-button-image">
                </button>
                </div>
                
                <div class="todo-body collapse row" id="collapse{{ todo.id }}">
                    {{ todo.body }}
                </div>
                </div>
                </li>
            `,
            { todo: todo }
            );
        }
        document.getElementById("TODOlistGroup").innerHTML = txt;
    }
    
    function getClosest(elem, selector) {
        for ( ; elem && elem !== document; elem = elem.parentNode ) {
            console.log(`getClosest ${selector}`, elem.matches( selector ));
            if ( elem.matches( selector ) ) return elem;
        }
        return null;
    };

    console.log('socket.io starting');
    var socket = io('/home');

    socket.emit('get-todos', { },
    newtodos => { renderTODOS(newtodos); });

    document.getElementById('submitNewTodo').onclick = function() {
        if (document.getElementById('todoPrecedenceSelect').value === "-1") {
            console.error("Invalid precedence value");
            return;
        }
        socket.emit('create-todo', {
            title: document.getElementById('inputTodoTitle').value,
            body: document.getElementById('inputTodoBody').value,
            precedence: document.getElementById('todoPrecedenceSelect').value,
        },
        newtodos => {
            var myModalEl = document.getElementById('addTodoModal');
            var modal = bootstrap.Modal.getInstance(myModalEl);
            modal.hide();
            document.getElementById('inputTodoTitle').value = '';
            document.getElementById('inputTodoBody').value = '';
            document.getElementById('todoPrecedenceSelect').value = '-1';
            renderTODOS(newtodos);
        });
    }

    socket.on('new-todos', todos => { renderTODOS(todos); });

    document.querySelectorAll('#TODOlistGroup')[0]
    .addEventListener('click', function (event) {

        console.log(`#TODOlistGroup click `, event.target);
        
        if (event.target.classList.contains('edit-button-image')) {
            let parent = getClosest(event.target, '.edit-button');
            const id = parent.getAttribute('data-id');
            console.log(`emit edit-todo ${id}`);
        }

        if (event.target.classList.contains('delete-button-image')) {
    
            let parent = getClosest(event.target, '.delete-button');
    
            const id = parent.getAttribute('data-id');
            console.log(`emit delete-todo ${id}`);
            socket.emit('delete-todo', { id: id });
        }
    
    }, false);

});