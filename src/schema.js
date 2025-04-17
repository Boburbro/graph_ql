const { gql } = require('graphql-tag');

const typeDefs = gql`
  type User {
    id: ID!
    username: String
    email: String!
    createdAt: String!
    isVerified: Boolean!
    isAdmin: Boolean!
    todos: [Todo!]
  }

  type Todo {
    id: ID!
    title: String!
    description: String
    completed: Boolean!
    createdAt: String!
    updatedAt: String!
    user: User!
  }

  type ChatRoom {
    id: ID!
    name: String!
    createdAt: String!
    messages: [Message!]
  }

  type Message {
    id: ID!
    content: String!
    createdAt: String!
    user: User!
    room: ChatRoom!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type VerificationResult {
    success: Boolean!
    message: String
  }

  type AdminStats {
    totalUsers: Int!
    verifiedUsers: Int!
    totalTodos: Int!
    completedTodos: Int!
    totalChatRooms: Int!
    totalMessages: Int!
  }

  type AdminLoginResponse {
    token: String!
    success: Boolean!
  }

  type Query {
    # User queries
    me: User
    
    # Todo queries
    todos: [Todo!]!
    todo(id: ID!): Todo

    # Chat queries
    chatRooms: [ChatRoom!]!
    chatRoom(id: ID!): ChatRoom
    messages(roomId: ID!): [Message!]!

    # Admin queries
    adminStats: AdminStats!
    allUsers: [User!]!
  }

  type Mutation {
    # Auth mutations
    register(email: String!, password: String!, username: String): VerificationResult!
    verifyEmail(email: String!, code: String!): AuthPayload!
    resendVerificationCode(email: String!): VerificationResult!
    login(email: String!, password: String!): AuthPayload!
    adminLogin(username: String!, password: String!): AdminLoginResponse!
    
    # Todo mutations
    createTodo(title: String!, description: String): Todo!
    updateTodo(id: ID!, title: String, description: String, completed: Boolean): Todo!
    deleteTodo(id: ID!): Boolean!
    
    # Chat mutations
    createChatRoom(name: String!): ChatRoom!
    sendMessage(content: String!, roomId: ID!): Message!

    # Admin mutations
    verifyAdminSecurityCode(code: String!): Boolean!
    setAdminStatus(userId: ID!, isAdmin: Boolean!): User!
    deleteUser(userId: ID!): Boolean!
  }

  type Subscription {
    newMessage(roomId: ID!): Message!
  }
`;

module.exports = typeDefs; 