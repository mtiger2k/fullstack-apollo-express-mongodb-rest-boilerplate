import mongoose from 'mongoose';
import isEmail from 'validator/lib/isEmail';

const commentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  name: String,
  email: {
    type: String,
    validate: [isEmail, 'No valid email address provided.'],
  },
  body: String
});

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
