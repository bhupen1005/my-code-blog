'use client'

import { useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { slug } from 'github-slugger'
import { formatDate } from 'pliny/utils/formatDate'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'
import Link from '@/components/Link'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import categoryData from 'app/category-data.json'

interface PaginationProps {
  totalPages: number
  currentPage: number
}
interface ListLayoutProps {
  posts: CoreContent<Blog>[]
  title: string
  initialDisplayPosts?: CoreContent<Blog>[]
  pagination?: PaginationProps
  allPosts?: CoreContent<Blog>[]
}

function Pagination({ totalPages, currentPage }: PaginationProps) {
  const pathname = usePathname()
  const segments = pathname.split('/')
  const lastSegment = segments[segments.length - 1]
  const basePath = pathname
    .replace(/^\//, '') // Remove leading slash
    .replace(/\/page\/\d+\/?$/, '') // Remove any trailing /page
    .replace(/\/$/, '') // Remove trailing slash
  const prevPage = currentPage - 1 > 0
  const nextPage = currentPage + 1 <= totalPages

  return (
    <div className="space-y-2 pt-6 pb-8 md:space-y-5">
      <nav className="flex justify-between">
        {!prevPage && (
          <button className="cursor-auto disabled:opacity-50" disabled={!prevPage}>
            Previous
          </button>
        )}
        {prevPage && (
          <Link
            href={currentPage - 1 === 1 ? `/${basePath}/` : `/${basePath}/page/${currentPage - 1}`}
            rel="prev"
          >
            Previous
          </Link>
        )}
        <span>
          {currentPage} of {totalPages}
        </span>
        {!nextPage && (
          <button className="cursor-auto disabled:opacity-50" disabled={!nextPage}>
            Next
          </button>
        )}
        {nextPage && (
          <Link href={`/${basePath}/page/${currentPage + 1}`} rel="next">
            Next
          </Link>
        )}
      </nav>
    </div>
  )
}

export default function ListLayoutWithTags({
  posts,
  title,
  initialDisplayPosts = [],
  pagination,
  allPosts,
}: ListLayoutProps) {
  const pathname = usePathname()
  const categories = categoryData as Record<string, { name: string; count: number }>
  const sortedCategorySlugs = Object.keys(categories).sort(
    (a, b) => categories[b].count - categories[a].count
  )

  const displayPosts = initialDisplayPosts.length > 0 ? initialDisplayPosts : posts

  const sourcePosts = allPosts ?? posts
  const postsByCategory = useMemo(() => {
    const map: Record<string, CoreContent<Blog>[]> = {}
    for (const post of sourcePosts) {
      if (!post.category) continue
      const key = slug(post.category)
      if (!map[key]) map[key] = []
      map[key].push(post)
    }
    return map
  }, [sourcePosts])

  const activeCategorySlug =
    pathname.startsWith('/categories/') && pathname.split('/categories/')[1]
      ? decodeURI(pathname.split('/categories/')[1].split('/')[0])
      : null

  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(activeCategorySlug ? [activeCategorySlug] : [])
  )

  const toggle = (categorySlug: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(categorySlug)) next.delete(categorySlug)
      else next.add(categorySlug)
      return next
    })
  }

  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false)

  const categoryTree = (
    <>
      {pathname.startsWith('/blog') ? (
        <h3 className="text-primary-500 font-bold uppercase">All Posts</h3>
      ) : (
        <Link
          href={`/blog`}
          className="hover:text-primary-500 dark:hover:text-primary-500 font-bold text-gray-700 uppercase dark:text-gray-300"
        >
          All Posts
        </Link>
      )}
      <ul>
        {sortedCategorySlugs.map((catSlug) => {
          const cat = categories[catSlug]
          const isActive = activeCategorySlug === catSlug
          const isOpen = expanded.has(catSlug)
          const catPosts = postsByCategory[catSlug] ?? []
          return (
            <li key={catSlug} className="my-3">
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => toggle(catSlug)}
                  aria-expanded={isOpen}
                  aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${cat.name} category`}
                  className="hover:text-primary-500 dark:hover:text-primary-500 mr-1 flex h-5 w-5 items-center justify-center text-gray-500 dark:text-gray-400"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className={`h-3 w-3 transition-transform duration-150 ${
                      isOpen ? 'rotate-90' : ''
                    }`}
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.21 14.77a.75.75 0 0 1 0-1.06L10.94 10 7.21 6.29a.75.75 0 1 1 1.06-1.06l4.25 4.24a.75.75 0 0 1 0 1.06l-4.25 4.24a.75.75 0 0 1-1.06 0Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {isActive ? (
                  <h3 className="text-primary-500 inline px-1 py-2 text-sm font-bold uppercase">
                    {`${cat.name} (${cat.count})`}
                  </h3>
                ) : (
                  <Link
                    href={`/categories/${catSlug}`}
                    className="hover:text-primary-500 dark:hover:text-primary-500 px-1 py-2 text-sm font-medium text-gray-500 uppercase dark:text-gray-300"
                    aria-label={`View posts in ${cat.name} category`}
                  >
                    {`${cat.name} (${cat.count})`}
                  </Link>
                )}
              </div>
              {isOpen && catPosts.length > 0 && (
                <ul className="mt-1 ml-6 border-l border-gray-200 pl-3 dark:border-gray-700">
                  {catPosts.map((p) => (
                    <li key={p.path} className="my-1">
                      <Link
                        href={`/${p.path}`}
                        className="hover:text-primary-500 dark:hover:text-primary-500 block py-1 text-xs text-gray-600 dark:text-gray-400"
                      >
                        {p.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
    </>
  )

  return (
    <>
      <div>
        <div className="pt-6 pb-6">
          <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:hidden sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
            {title}
          </h1>
        </div>
        <div className="mb-4 rounded-sm bg-gray-50 shadow-md sm:hidden dark:bg-gray-900/70 dark:shadow-gray-800/40">
          <button
            type="button"
            onClick={() => setMobileCategoriesOpen((v) => !v)}
            aria-expanded={mobileCategoriesOpen}
            aria-controls="mobile-categories-panel"
            className="hover:text-primary-500 dark:hover:text-primary-500 flex w-full items-center justify-between px-4 py-3 text-sm font-bold text-gray-700 uppercase dark:text-gray-300"
          >
            <span>Categories</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className={`h-4 w-4 transition-transform duration-150 ${
                mobileCategoriesOpen ? 'rotate-90' : ''
              }`}
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M7.21 14.77a.75.75 0 0 1 0-1.06L10.94 10 7.21 6.29a.75.75 0 1 1 1.06-1.06l4.25 4.24a.75.75 0 0 1 0 1.06l-4.25 4.24a.75.75 0 0 1-1.06 0Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          {mobileCategoriesOpen && (
            <div
              id="mobile-categories-panel"
              className="max-h-[60vh] overflow-auto border-t border-gray-200 px-4 pt-2 pb-4 dark:border-gray-700"
            >
              {categoryTree}
            </div>
          )}
        </div>
        <div className="flex sm:space-x-24">
          <div className="hidden h-full max-h-screen max-w-[280px] min-w-[280px] flex-wrap overflow-auto rounded-sm bg-gray-50 pt-5 shadow-md sm:flex dark:bg-gray-900/70 dark:shadow-gray-800/40">
            <div className="px-6 py-4">{categoryTree}</div>
          </div>
          <div>
            <ul>
              {displayPosts.map((post) => {
                const { path, date, title, summary, tags } = post
                return (
                  <li key={path} className="py-5">
                    <article className="flex flex-col space-y-2 xl:space-y-0">
                      <dl>
                        <dt className="sr-only">Published on</dt>
                        <dd className="text-base leading-6 font-medium text-gray-500 dark:text-gray-400">
                          <time dateTime={date} suppressHydrationWarning>
                            {formatDate(date, siteMetadata.locale)}
                          </time>
                        </dd>
                      </dl>
                      <div className="space-y-3">
                        <div>
                          <h2 className="text-2xl leading-8 font-bold tracking-tight">
                            <Link href={`/${path}`} className="text-gray-900 dark:text-gray-100">
                              {title}
                            </Link>
                          </h2>
                          <div className="flex flex-wrap">
                            {tags?.map((tag) => (
                              <Tag key={tag} text={tag} />
                            ))}
                          </div>
                        </div>
                        <div className="prose max-w-none text-gray-500 dark:text-gray-400">
                          {summary}
                        </div>
                      </div>
                    </article>
                  </li>
                )
              })}
            </ul>
            {pagination && pagination.totalPages > 1 && (
              <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} />
            )}
          </div>
        </div>
      </div>
    </>
  )
}
