import mongoose from 'mongoose';

import User from './user';
import Post from './post';
import Comment from './comment';
import Message from './message';

const connectDb = () => {
  console.log(process.env.TEST_DATABASE_URL)
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

const restMap = [
  {name: "users", model: User},
  {name: "posts", model: Post},
  {name: "comments", model: Comment}
]

const models = { User, Post, Comment, Message };

export { connectDb, restMap };

export default models;
