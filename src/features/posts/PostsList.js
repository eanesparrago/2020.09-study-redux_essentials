import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import PostExcerpt from './PostExcerpt'
import { selectAllPosts, fetchPosts } from './postsSlice'

const PostsList = () => {
  const dispatch = useDispatch()
  const posts = useSelector(selectAllPosts)

  const postStatus = useSelector((state) => state.posts.status)
  const error = useSelector((state) => state.posts.error)

  useEffect(() => {
    if (postStatus === 'idle') {
      dispatch(fetchPosts())
    }
  }, [postStatus, dispatch])

  let content

  // if (postStatus === 'loading') {
  //   content = <div className="loader">Loading...</div>
  // } else if (postStatus === 'succeeded') {
  //   const orderedPosts = posts
  //     .slice()
  //     .sort((a, b) => b.date.localeCompare(a.date))

  //   content = orderedPosts.map((post) => (
  //     <PostExcerpt key={post.id} post={post}></PostExcerpt>
  //   ))
  // } else if (postStatus === 'failed') {
  //   content = <div>{error}</div>
  // }

  switch (postStatus) {
    case 'loading':
      content = <div className="loader">Loading...</div>
      break

    case 'succeeded':
      const orderedPosts = posts
        .slice()
        .sort((a, b) => b.date.localeCompare(a.date))

      content = orderedPosts.map((post) => (
        <PostExcerpt key={post.id} post={post}></PostExcerpt>
      ))
      break

    case 'failed':
    default:
      content = <div>{error}</div>
  }

  return (
    <section>
      <h2>Posts</h2>

      {content}
    </section>
  )
}

export default React.memo(PostsList)
