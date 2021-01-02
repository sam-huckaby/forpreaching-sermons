// The interface for the DB sermon model
export interface Sermon {
    _id: string;
    title: string;
    scripture: string;
    summary: string;
    body: string;
    creator: string;
    createdAt: Number;
    updatedAt: Number;
    readTime: Number;
  }