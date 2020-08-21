# nodejs-express-todo-demo
Sample TODO application written with Node.js and Express, using Sequelize for the database, Bootstrap v5 and Bootstrap Icons for the UI, no jQuery, and using Socket.IO for communication with server.

This is a simple little Node.js/Express application which I'll use as reference in several blog posts.  (TO BE WRITTEN)

To use the application:

1. Clone the repository
1. Run: `npm install`
1. Run: `PORT=4000 DEBUG=todos:* SEQUELIZE_CONNECT=models/sequelize-sqlite.yaml npm start`

The SEQUELIZE_CONNECT file lets you easily configure the database connection.  The application uses Sequelize which gives compatibility with a long list of SQL database engines.  As configured it is using SQLITE3.

In `app.mjs` is the wiring for the application.  It simply pulls everything together, and has no executable code of its own.

In `routes/index.mjs` is the Express route handler for the home page, as well as Socket.IO code listening to the browser code that is the user interface.

In `public/main.js` is the JavaScript that runs in the browser for the user interface.

In `models/sequlz.mjs` and `models/Todo.mjs` is the database interface.

In `views/index.njk` is the HTML template for the home page, written as a Nunjucks template.

It uses Bootstrap for user interface components and responsive layout.  It is a simple app, that is just a List Group with each row containing the UI for a TODO item.  That UI includes a few buttons, and a collapsed TODO description.

Instead of normal FORM requests to send data to the server and get responses, the application uses Socket.IO for bidirectional communication with the server.  One effect is that multiple users can be interacting together with the TODO list.
