const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  
  const user = users.find(user => user.username === username);

  if(!user){
    return response.status(404).send({error: "User not Found"});
  }

  request.user = user;

  return next();

}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.find(user => user.username === username);

  if(userAlreadyExists){
    return response.status(400).send({error: "User Already Exists"});
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user);

  return response.status(201).send();
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.user;

  return response.status(200).send (user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(todo);

  return response.status(201).send();
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const { id } = request.params;
  const { title, deadline} = request.body;

  const foundTodo = user.todos.find(todo => todo.id === id);

  if(!foundTodo){
    return response.status(404).send({ error: "Todo not found!"});
  }

  foundTodo.title = title;
  foundTodo.deadline = new Date(deadline);

  return response.status(200).send();

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const { id } = request.params;

  const foundTodo = user.todos.find(todo => todo.id === id);

  if(!foundTodo){
    return response.status(404).send({ error: "Todo not found!"});
  }

  foundTodo.done = true;

  return response.status(200).send();
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const { id } = request.params;

  const foundTodo = user.todos.find(todo => todo.id === id);

  if(!foundTodo){
    return response.status(404).send({ error: "Todo not found!"});
  }

  user.todos.splice(foundTodo, 1);

  return response.status(204).send();
});

module.exports = app;