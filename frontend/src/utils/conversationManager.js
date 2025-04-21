// Conversation management utilities

export class Conversation {
  constructor(userId) {
    this._id = null; // MongoDB conversation ID
    this.userId = userId;
    this.messages = [];
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.isActive = true;
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

  setMongoId(id) {
    this._id = id;
  }

  getMongoId() {
    return this._id;
  }

  toJSON() {
    return {
      _id: this._id,
      userId: this.userId,
      messages: this.messages,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isActive: this.isActive
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
  conversation._id = json._id;
  conversation.messages = json.messages;
  conversation.createdAt = new Date(json.createdAt);
  conversation.updatedAt = new Date(json.updatedAt);
  conversation.isActive = json.isActive;
  return conversation;
}; 