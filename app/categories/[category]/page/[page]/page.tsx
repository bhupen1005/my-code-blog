import { slug } from 'github-slugger'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import ListLayout from '@/layouts/ListLayoutWithTags'
import { allBlogs } from 'contentlayer/generated'
import categoryData from 'app/category-data.json'
import { notFound } from 'next/navigation'

const POSTS_PER_PAGE = 5

export const generateStaticParams = async () => {
  const categories = categoryData as Record<string, { name: string; count: number }>
  return Object.keys(categories).flatMap((catSlug) => {
    const totalPages = Math.max(1, Math.ceil(categories[catSlug].count / POSTS_PER_PAGE))
    return Array.from({ length: totalPages }, (_, i) => ({
      category: encodeURI(catSlug),
      page: (i + 1).toString(),
    }))
  })
}

export default async function CategoryPaginatedPage(props: {
  params: Promise<{ category: string; page: string }>
}) {
  const params = await props.params
  const catSlug = decodeURI(params.category)
  const categories = categoryData as Record<string, { name: string; count: number }>
  const display = categories[catSlug]?.name
  if (!display) return notFound()

  const pageNumber = parseInt(params.page)
  const allSortedPosts = allCoreContent(sortPosts(allBlogs))
  const filteredPosts = allSortedPosts.filter(
    (post) => post.category && slug(post.category) === catSlug
  )
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE)

  if (pageNumber <= 0 || pageNumber > totalPages || isNaN(pageNumber)) {
    return notFound()
  }

  const initialDisplayPosts = filteredPosts.slice(
    POSTS_PER_PAGE * (pageNumber - 1),
    POSTS_PER_PAGE * pageNumber
  )
  const pagination = {
    currentPage: pageNumber,
    totalPages: totalPages,
  }

  return (
    <ListLayout
      posts={filteredPosts}
      allPosts={allSortedPosts}
      initialDisplayPosts={initialDisplayPosts}
      pagination={pagination}
      title={display}
    />
  )
}
