# Todo + Chat GraphQL API

A full-featured GraphQL backend for a Todo and Chat application with authentication, real-time subscriptions, and authorization rules.

## Features

- **User Authentication**
  - JWT-based authentication
  - Signup and Login
- **Todo Management**
  - Create, read, update, and delete todos
  - Todo ownership and authorization
- **Chat System**
  - Create chat rooms
  - Send and receive messages
  - Real-time updates via GraphQL subscriptions

## Tech Stack

- **Backend**: Node.js, Express, Apollo Server
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT
- **Real-time**: GraphQL Subscriptions

## Setup and Installation

1. **Clone the repository**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a .env file**
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/todochat?schema=public"
   JWT_SECRET="your-secret-key-here"
   PORT=4000
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

5. **Start the server**
   ```bash
   npm run dev
   ```

## API Examples

Here are some example GraphQL operations you can perform:

### Authentication

#### Signup
```graphql
mutation Signup {
  signup(username: "user1", email: "user1@example.com", password: "password123") {
    token
    user {
      id
      username
      email
    }
  }
}
```

#### Login
```graphql
mutation Login {
  login(email: "user1@example.com", password: "password123") {
    token
    user {
      id
      username
    }
  }
}
```

### Todo Operations

#### Create Todo
```graphql
mutation CreateTodo {
  createTodo(title: "Learn GraphQL", description: "Study Apollo Server and GraphQL subscriptions") {
    id
    title
    description
    completed
  }
}
```

#### Get All Todos
```graphql
query GetTodos {
  todos {
    id
    title
    description
    completed
    createdAt
    updatedAt
  }
}
```

#### Update Todo
```graphql
mutation UpdateTodo {
  updateTodo(id: "1", title: "Master GraphQL", completed: true) {
    id
    title
    completed
    updatedAt
  }
}
```

#### Delete Todo
```graphql
mutation DeleteTodo {
  deleteTodo(id: "1")
}
```

### Chat Operations

#### Create Chat Room
```graphql
mutation CreateChatRoom {
  createChatRoom(name: "General") {
    id
    name
    createdAt
  }
}
```

#### Send Message
```graphql
mutation SendMessage {
  sendMessage(content: "Hello, world!", roomId: "1") {
    id
    content
    createdAt
    user {
      username
    }
  }
}
```

#### Get Messages
```graphql
query GetMessages {
  messages(roomId: "1") {
    id
    content
    createdAt
    user {
      username
    }
  }
}
```

#### Subscribe to New Messages
```graphql
subscription OnNewMessage {
  newMessage(roomId: "1") {
    id
    content
    createdAt
    user {
      username
    }
  }
}
```

## Authentication

To authenticate requests, include the JWT token in the Authorization header:

```
Authorization: Bearer YOUR_TOKEN
```

For subscriptions, include the token in the connection parameters:

```javascript
const client = new GraphQLWsClient({
  url: 'ws://localhost:4000/graphql',
  connectionParams: {
    authToken: 'YOUR_TOKEN'
  }
});
``` 