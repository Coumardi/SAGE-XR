// Conversation management utilities

export class Conversation {
  constructor(userId) {
    this.id = Date.now().toString(); // Unique ID for the conversation
    this.userId = userId;
    this.messages = [];
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  addMessage(message) {
    this.messages.push({
      ...message,
      timestamp: new Date().toISOString()
    });
    this.updatedAt = new Date();
  }

  getContext() {
    // Convert messages to a format suitable for API context
    return this.messages.map(msg => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.text
    }));
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      messages: this.messages,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

// Create a new conversation
export const createConversation = (userId) => {
  return new Conversation(userId);
};

// Load a conversation from JSON
export const loadConversation = (json) => {
  const conversation = new Conversation(json.userId);
  conversation.id = json.id;
  conversation.messages = json.messages;
  conversation.createdAt = new Date(json.createdAt);
  conversation.updatedAt = new Date(json.updatedAt);
  return conversation;
}; 