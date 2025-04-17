// Example client for testing GraphQL subscriptions
// This requires a browser environment or ws/graphql-ws libraries for Node.js
// For demonstration purposes only

/*
 * To use this in a Node.js environment, you would need:
 * npm install ws graphql-ws
 * 
 * Then uncomment the following imports:
 *
 * const { createClient } = require('graphql-ws');
 * const WebSocket = require('ws');
 */

// Create a GraphQL over WebSocket client
function createSubscriptionClient(url, token) {
    // For browser environments
    return {
        url,
        connectionParams: {
            authToken: token,
        },
        // Implementation would depend on the environment (browser/Node.js)
        // For browser, you would use:
        // connection: {
        //   on: (event, cb) => {},
        //   close: () => {},
        // },
        // For Node.js with graphql-ws:
        // client: createClient({
        //   url,
        //   webSocketImpl: WebSocket,
        //   connectionParams: { authToken: token },
        // }),
    };
}

// Example subscription operation
function subscribeToNewMessages(roomId, token, onMessage, onError) {
    console.log(`Subscribing to new messages in room ${roomId}...`);

    // The subscription query
    const newMessageSubscription = `
    subscription OnNewMessage($roomId: ID!) {
      newMessage(roomId: $roomId) {
        id
        content
        createdAt
        user {
          username
        }
      }
    }
  `;

    // Variables for the subscription
    const variables = {
        roomId,
    };

    // In an actual implementation, you would:
    // 1. Create a WebSocket connection to the GraphQL server
    // 2. Send the subscription request
    // 3. Listen for messages

    // Example pseudocode for a subscription setup:
    /*
    const client = createSubscriptionClient('ws://localhost:4000/graphql', token);
    
    // For browser:
    const wsConnection = new WebSocket(client.url);
    wsConnection.onopen = () => {
      wsConnection.send(JSON.stringify({
        type: 'connection_init',
        payload: client.connectionParams,
      }));
      
      wsConnection.send(JSON.stringify({
        id: '1',
        type: 'subscribe',
        payload: {
          query: newMessageSubscription,
          variables,
        },
      }));
    };
    
    wsConnection.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'next' && data.payload.data) {
        onMessage(data.payload.data.newMessage);
      }
    };
    
    wsConnection.onerror = (error) => {
      onError(error);
    };
    
    // For Node.js with graphql-ws:
    const unsubscribe = client.client.subscribe(
      {
        query: newMessageSubscription,
        variables,
      },
      {
        next: (data) => onMessage(data.data.newMessage),
        error: onError,
        complete: () => console.log('Subscription complete'),
      }
    );
    
    // Return cleanup function
    return () => {
      // For browser:
      // wsConnection.close();
      
      // For Node.js:
      // unsubscribe();
    };
    */

    console.log('Subscription setup complete! (In a real implementation, messages would appear here)');

    // Return dummy cleanup function
    return () => console.log('Subscription closed');
}

// Example usage (in a real environment)
function example() {
    console.log('WebSocket Subscription Example:');
    console.log('------------------------------');
    console.log('1. First authenticate with the GraphQL API to get a token');
    console.log('2. Connect to the WebSocket endpoint with your token');
    console.log('3. Subscribe to a specific chat room');
    console.log('4. Send messages to that room using the HTTP API');
    console.log('5. Receive real-time updates via the subscription');
    console.log('\nExample subscription code:');
    console.log(`
  // After authentication:
  const token = "your-jwt-token";
  const roomId = "1"; // ID of the room to subscribe to
  
  // Subscribe to new messages
  const unsubscribe = subscribeToNewMessages(
    roomId, 
    token,
    (message) => {
      console.log("New message received:", message);
    },
    (error) => {
      console.error("Subscription error:", error);
    }
  );
  
  // Later, to clean up:
  // unsubscribe();
  `);
}

// Run the example
example(); 