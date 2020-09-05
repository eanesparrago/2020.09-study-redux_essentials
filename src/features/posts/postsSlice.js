import {
  createSlice,
  createSelector,
  createAsyncThunk,
  createEntityAdapter,
} from '@reduxjs/toolkit'

import { client } from '../../api/client'

// ---

// Entity adapter
const postsAdapter = createEntityAdapter({
  sortComparer: (a, b) => b.date.localeCompare(a.date), // Newest posts first
})

// Initial state - returns { ids: [], entities: {} } plus the object that's passed
const initialState = postsAdapter.getInitialState({
  status: 'idle',
  error: null,
})

// Thunks
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

// Slice
const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    postUpdated: (state, action) => {
      const { id, title, content } = action.payload

      // Use lookup table instead of looping
      const existingPost = state.entities[id]

      if (existingPost) {
        existingPost.title = title
        existingPost.content = content
      }
    },
    reactionAdded(state, action) {
      const { postId, reaction } = action.payload

      const existingPost = state.entities[postId]

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

      postsAdapter.upsertMany(state, action.payload)
      /*
      When we receive the fetchPosts.fulfilled action, we can use
      the postsAdapter.upsertMany function to add all of the incoming
      posts to the state, by passing in the draft state and the array of
      posts in action.payload. If there's any items in action.payload
      that already existing in our state, the upsertMany function will
      merge them together based on matching IDs.
      */
    },
    [fetchPosts.rejected]: (state, action) => {
      state.status = 'failed'
      state.error = action.error.message
    },
    [addNewPost.fulfilled]: postsAdapter.addOne,
  },
})

export default postsSlice.reducer

export const { postAdded, postUpdated, reactionAdded } = postsSlice.actions

// Selectors from entity adapter
export const {
  selectAll: selectAllPosts,
  selectById: selectPostById,
  selectIds: selectPostIds,
} = postsAdapter.getSelectors((state) => state.posts)

// export const selectAllPosts = (state) => state.posts.posts

// export const selectPostById = (state, postId) =>
//   state.posts.posts.find((post) => post.id === postId)

// Selectors
export const selectPostsByUser = createSelector(
  // "Input selector" functions
  // Each of their returns become arguments for the output selector
  [selectAllPosts, (state, userId) => userId],

  // "Output selector" function
  (posts, userId) => posts.filter((post) => post.user === userId)
)
