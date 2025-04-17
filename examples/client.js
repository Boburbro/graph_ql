// Example client for testing the GraphQL API
// This is for demonstration purposes only

// For HTTP requests (queries/mutations)
async function graphqlRequest(query, variables = {}, token = null) {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch('http://localhost:4000/graphql', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  return response.json();
}

// Example usage
async function examples() {
  console.log('Running GraphQL API examples...');
  
  // Signup
  const signupMutation = `
    mutation Signup($username: String!, $email: String!, $password: String!) {
      signup(username: $username, email: $email, password: $password) {
        token
        user {
          id
          username
          email
        }
      }
    }
  `;

  const signupVars = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
  };

  console.log('1. Signing up a user...');
  const signupResult = await graphqlRequest(signupMutation, signupVars);
  console.log(signupResult);

  // Store token for authenticated requests
  const token = signupResult.data?.signup?.token;
  if (!token) {
    console.error('Failed to get authentication token. Stopping examples.');
    return;
  }

  // Create a todo
  const createTodoMutation = `
    mutation CreateTodo($title: String!, $description: String) {
      createTodo(title: $title, description: $description) {
        id
        title
        description
        completed
      }
    }
  `;

  const todoVars = {
    title: 'Test Todo',
    description: 'This is a test todo item',
  };

  console.log('\n2. Creating a todo...');
  const createTodoResult = await graphqlRequest(createTodoMutation, todoVars, token);
  console.log(createTodoResult);

  // Get user's todos
  const todosQuery = `
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
  `;

  console.log('\n3. Getting user todos...');
  const todosResult = await graphqlRequest(todosQuery, {}, token);
  console.log(todosResult);

  // Create a chat room
  const createRoomMutation = `
    mutation CreateRoom($name: String!) {
      createChatRoom(name: $name) {
        id
        name
        createdAt
      }
    }
  `;

  const roomVars = {
    name: 'Test Room',
  };

  console.log('\n4. Creating a chat room...');
  const createRoomResult = await graphqlRequest(createRoomMutation, roomVars, token);
  console.log(createRoomResult);

  // Get chat rooms
  const roomsQuery = `
    query GetRooms {
      chatRooms {
        id
        name
        createdAt
      }
    }
  `;

  console.log('\n5. Getting chat rooms...');
  const roomsResult = await graphqlRequest(roomsQuery, {}, token);
  console.log(roomsResult);

  // Send a message
  if (createRoomResult.data?.createChatRoom?.id) {
    const roomId = createRoomResult.data.createChatRoom.id;
    
    const sendMessageMutation = `
      mutation SendMessage($content: String!, $roomId: ID!) {
        sendMessage(content: $content, roomId: $roomId) {
          id
          content
          createdAt
          user {
            username
          }
        }
      }
    `;

    const messageVars = {
      content: 'Hello from the test client!',
      roomId,
    };

    console.log('\n6. Sending a message...');
    const sendMessageResult = await graphqlRequest(sendMessageMutation, messageVars, token);
    console.log(sendMessageResult);

    // Get messages in room
    const messagesQuery = `
      query GetMessages($roomId: ID!) {
        messages(roomId: $roomId) {
          id
          content
          createdAt
          user {
            username
          }
        }
      }
    `;

    const messagesVars = {
      roomId,
    };

    console.log('\n7. Getting messages in room...');
    const messagesResult = await graphqlRequest(messagesQuery, messagesVars, token);
    console.log(messagesResult);
  }

  console.log('\nAll examples completed!');
}

// Run the examples
examples().catch(error => {
  console.error('Error running examples:', error);
}); 