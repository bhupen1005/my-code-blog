import { slug } from 'github-slugger'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import siteMetadata from '@/data/siteMetadata'
import ListLayout from '@/layouts/ListLayoutWithTags'
import { allBlogs } from 'contentlayer/generated'
import categoryData from 'app/category-data.json'
import { genPageMetadata } from 'app/seo'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

const POSTS_PER_PAGE = 5

export async function generateMetadata(props: {
  params: Promise<{ category: string }>
}): Promise<Metadata> {
  const params = await props.params
  const categories = categoryData as Record<string, { name: string; count: number }>
  const catSlug = decodeURI(params.category)
  const display = categories[catSlug]?.name ?? catSlug
  return genPageMetadata({
    title: display,
    description: `${siteMetadata.title} ${display} category`,
    alternates: {
      canonical: './',
    },
  })
}

export const generateStaticParams = async () => {
  const categories = categoryData as Record<string, { name: string; count: number }>
  return Object.keys(categories).map((catSlug) => ({
    category: encodeURI(catSlug),
  }))
}

export default async function CategoryPage(props: { params: Promise<{ category: string }> }) {
  const params = await props.params
  const catSlug = decodeURI(params.category)
  const categories = categoryData as Record<string, { name: string; count: number }>
  const display = categories[catSlug]?.name
  if (!display) return notFound()

  const allSortedPosts = allCoreContent(sortPosts(allBlogs))
  const filteredPosts = allSortedPosts.filter(
    (post) => post.category && slug(post.category) === catSlug
  )
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE)
  const initialDisplayPosts = filteredPosts.slice(0, POSTS_PER_PAGE)
  const pagination = {
    currentPage: 1,
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
