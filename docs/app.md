# Creating a new App

## Install Dataent.js

```
yarn add dataentjs
```

DataentJS comes with built in rollup config for your files

## Build

There are 2 files that get built for the Desk single page application

- `/dist/js/bundle.js`
- `/dist/css/style.css`

Your `rollup.config.js` should look like:

```js
module.exports = [
	require('dataentjs/config/rollup.config.style.js'),
	require('dataentjs/config/rollup.config.app.js')
]
```

## Create a basic app

### index.html

The UI for the single page app (desk) will be built inside the `body` element, so you just need to have an empty body element, and link your JS bundle in `index.html`

Sample index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Document</title>
	<link href="/dist/css/style.css" rel="stylesheet">
</head>
<body>
	<script src="/dist/js/socket.io.js"></script>
	<script src="js/bundle.js"></script>
</body>
</html>
```
## For development setup

Clone dataentjs in the same folder as your app, since you will be developing dataentjs on the side.

### Link dataentjs

```sh
# make dataentjs linkable
cd dataentjs

yarn link
yarn link dataentjs

# link dataentjs in all
cd ../myapp
yarn link dataentjs

# install libs
yarn
```

### server.js

Create your server file `server.js`

```js
const server = require('dataentjs/server');

server.start({
    backend: 'sqlite',
    connection_params: {db_path: 'test.db'},
    static: './'
});
```

### index.js

In your client file you will have to import all your controllers and init them.

`dataentjs/client` lib will initialize your server and user interface with the Desk.

Example starting point for a to-do app:

```js
const client = require('dataentjs/client');
const todo = require('dataentjs/models/doctype/todo/todo.js');

// start server
client.start({
    server: 'localhost:8000',
}).then(() => {
    dataent.init_controller('todo', todo);

    dataent.desk.add_sidebar_item('Home', '#');
    dataent.desk.add_sidebar_item('New ToDo', '#new/todo');

    dataent.router.default = '/list/todo';
    dataent.router.show(window.location.hash);
});
```

## Start

To start the app and build webpack simultaneously you can use a `Procfile`

```yml
server: nodemon server.js
watch: node_modules/.bin/rollup -c --watch
```

You can use any procfile handler like `node-foreman` to start the processes.

```
yarn global add foreman
```

Then

```
nf start
```
