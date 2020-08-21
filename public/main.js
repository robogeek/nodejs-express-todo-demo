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
            <li class="list-group-item" id="todo{{ todo.id }}" data-id="{{ todo.id }}">
                <button type="button" class="btn todo-title"
                    data-toggle="collapse" data-target="#collapse{{ todo.id }}"
                    aria-expanded="false" aria-controls="collapse{{ todo.id }}"
                >{{ todo.title }}</button>
                <div class="float-right">
                
                {% if todo.precedence == 1 %}
                <span class="badge bg-success todo-precedence" data-precedence="1">Low</span>
                {% elseif todo.precedence == 2 %}
                <span class="badge bg-warning text-dark todo-precedence" data-precedence="2">Medium</span>
                {% elseif todo.precedence == 3 %}
                <span class="badge bg-danger todo-precedence" data-precedence="3">High</span>
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
                
                <div class="todo-body collapse row" id="collapse{{ todo.id }}">{{ todo.body }}</div>
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
        const id = document.getElementById('inputTodoID').value;
        let action;
        let options;
        if (id > '0') {
            action = 'edit-todo';
            options = {
                id: id,
                title: document.getElementById('inputTodoTitle').value,
                body: document.getElementById('inputTodoBody').value,
                precedence: document.getElementById('todoPrecedenceSelect').value,
            };
        } else {
            action = 'create-todo';
            options = {
                title: document.getElementById('inputTodoTitle').value,
                body: document.getElementById('inputTodoBody').value,
                precedence: document.getElementById('todoPrecedenceSelect').value,
            };
        }
        socket.emit(action, options,
        newtodos => {
            var myModalEl = document.getElementById('addTodoModal');
            var modal = bootstrap.Modal.getInstance(myModalEl);
            modal.hide();
            document.getElementById('inputTodoTitle').value = '';
            document.getElementById('inputTodoBody').value = '';
            document.getElementById('todoPrecedenceSelect').value = '-1';
            document.getElementById('inputTodoID').value = '-1';
            renderTODOS(newtodos);
        });
    }

    socket.on('new-todos', todos => { renderTODOS(todos); });

    // Because the buttons in the list are dynamically added and removed
    // it is not effective to attach event listeners directly to the buttons.
    // This approach relies on events bubbling upwards.  Every event will land
    // in the click event listener for the list group, and then we need to
    // inspect the event target to see which element is the target.
    //
    // For the buttons in this example, the target ends up being the <img>
    // within the button.  Hence we need to search upward to find
    // the <button>.
    //
    // See: https://gomakethings.com/how-to-get-the-closest-parent-element-with-a-matching-selector-using-vanilla-javascript/
    // See: https://gomakethings.com/checking-event-target-selectors-with-event-bubbling-in-vanilla-javascript/
    document.querySelectorAll('#TODOlistGroup')[0]
    .addEventListener('click', function (event) {

        console.log(`#TODOlistGroup click `, event.target);
        
        if (event.target.classList.contains('edit-button-image')) {
            let parent = getClosest(event.target, '.edit-button');
            const id = parent.getAttribute('data-id');
            console.log(`emit edit-todo ${id}`);

            // Set up the modal with the required values
            // We set inputTodoID so that it will be set when saved
            // and therefore cause 'edit-todo' event to be sent to server.

            document.getElementById('inputTodoID').value = `${id}`;
            document.getElementById('inputTodoTitle').value =
                document.querySelectorAll(`#todo${id} .todo-title`)[0].innerHTML;
            document.getElementById('inputTodoBody').value =
                document.querySelectorAll(`#todo${id} .todo-body`)[0].innerHTML;
            document.getElementById('todoPrecedenceSelect').value =
                document.querySelectorAll(`#todo${id} .todo-precedence`)[0]
                .getAttribute('data-precedence');

            let myModalEl = document.getElementById('addTodoModal');
            let modal = bootstrap.Modal.getInstance(myModalEl);
            if (!modal) {
                // If this was null, it means a Modal hasn't been created yet,
                // and it's up to us to create it.
                // On the other hand, if the user clicks the "+" button, then
                // Bootstrap creates this object instance.
                modal = new bootstrap.Modal(myModalEl);
            }
            modal.show();
        }

        if (event.target.classList.contains('delete-button-image')) {
            let parent = getClosest(event.target, '.delete-button');
            const id = parent.getAttribute('data-id');
            console.log(`emit delete-todo ${id}`);
            socket.emit('delete-todo', { id: id });
        }
    
    }, false);

});