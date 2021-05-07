const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userExists = users.find((user) => user.username === username);

  if (!userExists) {
    return response.status(404).json({ error: "User not found!" });
  }

  request.user = userExists;
  next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userExist = users.some((user) => user.username === username);

  if (userExist) {
    return response.status(400).json({ error: "User already exists!" });
  }

  users.push({
    id: uuidv4(),
    name,
    username,
    todos: [],
  });

  return response.status(201).json(users[users.length - 1]);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  user.todos.push({
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  });
  return response.status(201).json(user.todos[user.todos.length - 1]);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { user } = request;

  const searchTodo = user.todos.find((todo) => todo.id === id);

  if (!searchTodo) {
    return response.status(404).json({ error: "Todo not found!" });
  }
  user.todos.forEach((todo) => {
    if (todo.id === id) {
      todo.title = title;
      todo.deadline = deadline;
    }
  });

  return response.status(200).json(searchTodo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const searchTodo = user.todos.find((todo) => todo.id === id);

  if (!searchTodo) {
    return response.status(404).json({ error: "Todo not found!" });
  }
  user.todos.forEach((todo) => {
    if (todo.id === id) {
      todo.done = true;
    }
  });

  return response.status(200).json(searchTodo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;
  const searchTodo = user.todos.find((todo) => todo.id === id);
  if (!searchTodo) {
    return response.status(404).json({ error: "Todo not found!" });
  }
  user.todos.splice(searchTodo, 1);

  return response.status(204).send();
});

module.exports = app;
