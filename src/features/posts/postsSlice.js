import { createSlice, createSelector, createAsyncThunk } from '@reduxjs/toolkit'

import { client } from '../../api/client'

const initialState = {
  posts: [],
  status: 'idle',
  error: null,
}

export const fetchPosts = createAsyncThunk('posts/fetchPosts', async () => {
  const response = await client.get('/fakeApi/posts')

  return response.posts
})

export const addNewPost = createAsyncThunk(
  'posts/addNewPost',
  async (initialPost) => {
    const response = await client.post('/fakeApi/posts', { post: initialPost })

    return response.post
  }
)

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    postUpdated: (state, action) => {
      const { id, title, content } = action.payload
      const existingPost = state.posts.find((post) => post.id === id)
      if (existingPost) {
        existingPost.title = title
        existingPost.content = content
      }
    },
    reactionAdded(state, action) {
      const { postId, reaction } = action.payload

      const existingPost = state.posts.find((post) => post.id === postId)
      if (existingPost) {
        existingPost.reactions[reaction]++
      }
    },
  },
  extraReducers: {
    [fetchPosts.pending]: (state, action) => {
      state.status = 'loading'
    },
    [fetchPosts.fulfilled]: (state, action) => {
      state.status = 'succeeded'
      state.posts = state.posts.concat(action.payload)
    },
    [fetchPosts.rejected]: (state, action) => {
      state.status = 'failed'
      state.error = action.error.message
    },
    [addNewPost.fulfilled]: (state, action) => {
      state.posts.push(action.payload)
    },
  },
})

export default postsSlice.reducer

export const { postAdded, postUpdated, reactionAdded } = postsSlice.actions

export const selectAllPosts = (state) => state.posts.posts

export const selectPostById = (state, postId) =>
  state.posts.posts.find((post) => post.id === postId)

export const selectPostsByUser = createSelector(
  // "Input selector" functions
  // Each of their returns become arguments for the output selector
  [selectAllPosts, (state, userId) => userId],

  // "Output selector" function
  (posts, userId) => posts.filter((post) => post.user === userId)
)
