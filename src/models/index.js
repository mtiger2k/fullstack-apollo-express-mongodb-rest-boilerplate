import mongoose from 'mongoose';

import User from './user';
import Post from './post';
import Comment from './comment';
import Message from './message';

const connectDb = () => {
  if (process.env.TEST_DATABASE_URL) {
    return mongoose.connect(
      process.env.TEST_DATABASE_URL,
      { useNewUrlParser: true, useCreateIndex: true },
    );
  }

  if (process.env.DATABASE_URL) {
    return mongoose.connect(
      process.env.DATABASE_URL,
      { useNewUrlParser: true, useCreateIndex: true },
    );
  }
};

const models = { User, Post, Comment, Message };

export { connectDb };

export default models;
