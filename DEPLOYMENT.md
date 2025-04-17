# Todo + Chat GraphQL API Deployment Guide

This document explains how to deploy and use the Todo + Chat GraphQL API.

## Deployment Options

### Local Development

1. **Clone the repository**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a .env file**
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/todochat?schema=public"
   JWT_SECRET="your-secret-key-here"
   PORT=4000
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   npx prisma db seed
   ```

5. **Start the server**
   ```bash
   npm run dev  # For development
   npm start    # For production
   ```

### Production Deployment

For production, consider these deployment options:

1. **Heroku**
   - Create a new Heroku app
   - Add the Heroku Postgres add-on
   - Set environment variables in the Heroku dashboard
   - Deploy using the Heroku CLI or GitHub integration

2. **Docker**
   - Create a Dockerfile in the project root
   - Build and run the Docker image
   - Use Docker Compose to manage the app and database

3. **AWS/Digital Ocean/etc.**
   - Deploy to a VM
   - Set up a reverse proxy with Nginx
   - Use PM2 for process management
   - Set up SSL certificates

## API Documentation

The GraphQL API is self-documenting. Once the server is running, visit:

```
http://localhost:4000/graphql
```

This will open Apollo Explorer UI where you can:
- Browse the schema documentation
- Test queries and mutations
- View all available operations
- See required arguments and types

## Authentication

All requests except signup and login require JWT authentication. To authenticate:

1. **Get a token** by using the signup or login mutation
2. **Include the token** in the Authorization header:
   ```
   Authorization: Bearer YOUR_TOKEN
   ```

For WebSocket connections (subscriptions), include the token in connection parameters:
```javascript
{
  connectionParams: {
    authToken: 'YOUR_TOKEN'
  }
}
```

## API Examples

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
  createTodo(title: "Learn GraphQL", description: "Study Apollo Server") {
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

## Integration Examples

### Node.js Client

```javascript
const { GraphQLClient } = require('graphql-request');

// Create a GraphQL client
const client = new GraphQLClient('https://your-server.com/graphql', {
  headers: {
    authorization: 'Bearer YOUR_TOKEN',
  },
});

// Example query
const getTodosQuery = `
  query {
    todos {
      id
      title
      completed
    }
  }
`;

async function getTodos() {
  const data = await client.request(getTodosQuery);
  console.log(data.todos);
}

getTodos();
```

### React Client with Apollo Client

```javascript
import { ApolloClient, InMemoryCache, ApolloProvider, gql } from '@apollo/client';

// Create an Apollo Client
const client = new ApolloClient({
  uri: 'https://your-server.com/graphql',
  cache: new InMemoryCache(),
  headers: {
    authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});

// Example query component
function Todos() {
  const { loading, error, data } = useQuery(gql`
    query GetTodos {
      todos {
        id
        title
        completed
      }
    }
  `);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <ul>
      {data.todos.map(todo => (
        <li key={todo.id}>{todo.title} - {todo.completed ? 'Done' : 'Pending'}</li>
      ))}
    </ul>
  );
}
```

## Error Handling

The API returns standard GraphQL errors with this structure:

```json
{
  "errors": [
    {
      "message": "The error message",
      "path": ["fieldWithError"],
      "extensions": {
        "code": "ERROR_CODE"
      }
    }
  ]
}
```

Common error codes:
- UNAUTHENTICATED: Missing or invalid token
- FORBIDDEN: Not authorized to perform the action
- BAD_USER_INPUT: Invalid input values
- NOT_FOUND: Requested resource not found

## Monitoring and Maintenance

For production deployments:

1. **Implement logging** with Winston or similar
2. **Set up monitoring** with Prometheus/Grafana or a service like New Relic
3. **Configure error tracking** with Sentry
4. **Set up database backups** for PostgreSQL

## Security Considerations

1. **Always use HTTPS** in production
2. **Set a strong JWT secret** and rotate regularly
3. **Implement rate limiting** for API endpoints
4. **Sanitize user inputs** to prevent injection attacks
5. **Use a secure password hashing algorithm** (we use bcrypt)

## Support

For issues or questions, please open an issue in the repository or contact the project maintainers. 