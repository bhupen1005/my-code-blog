import Link from '@/components/Link'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import { formatDate } from 'pliny/utils/formatDate'
import NewsletterForm from 'pliny/ui/NewsletterForm'
import categoryData from 'app/category-data.json'

const MAX_DISPLAY = 5

export default function Home({ posts }) {
  const categories = categoryData as Record<string, { name: string; count: number }>
  const sortedCategorySlugs = Object.keys(categories).sort(
    (a, b) => categories[b].count - categories[a].count
  )

  return (
    <>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
            Latest
          </h1>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
            {siteMetadata.description}
          </p>
        </div>
        {sortedCategorySlugs.length > 0 && (
          <div className="py-8">
            <h2 className="mb-4 text-2xl leading-8 font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Browse by category
            </h2>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {sortedCategorySlugs.map((catSlug) => {
                const cat = categories[catSlug]
                return (
                  <li key={catSlug}>
                    <Link
                      href={`/categories/${catSlug}`}
                      className="hover:border-primary-500 hover:text-primary-500 dark:hover:border-primary-500 dark:hover:text-primary-500 group block rounded-md border border-gray-200 bg-gray-50 px-4 py-5 text-center transition-colors dark:border-gray-700 dark:bg-gray-900/50"
                      aria-label={`View posts in ${cat.name} category`}
                    >
                      <div className="text-base font-bold text-gray-900 group-hover:text-inherit dark:text-gray-100">
                        {cat.name}
                      </div>
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {cat.count} {cat.count === 1 ? 'post' : 'posts'}
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {!posts.length && 'No posts found.'}
          {posts.slice(0, MAX_DISPLAY).map((post) => {
            const { slug, date, title, summary, tags } = post
            return (
              <li key={slug} className="py-12">
                <article>
                  <div className="space-y-2 xl:grid xl:grid-cols-4 xl:items-baseline xl:space-y-0">
                    <dl>
                      <dt className="sr-only">Published on</dt>
                      <dd className="text-base leading-6 font-medium text-gray-500 dark:text-gray-400">
                        <time dateTime={date}>{formatDate(date, siteMetadata.locale)}</time>
                      </dd>
                    </dl>
                    <div className="space-y-5 xl:col-span-3">
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-2xl leading-8 font-bold tracking-tight">
                            <Link
                              href={`/blog/${slug}`}
                              className="text-gray-900 dark:text-gray-100"
                            >
                              {title}
                            </Link>
                          </h2>
                          <div className="flex flex-wrap">
                            {tags.map((tag) => (
                              <Tag key={tag} text={tag} />
                            ))}
                          </div>
                        </div>
                        <div className="prose max-w-none text-gray-500 dark:text-gray-400">
                          {summary}
                        </div>
                      </div>
                      <div className="text-base leading-6 font-medium">
                        <Link
                          href={`/blog/${slug}`}
                          className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                          aria-label={`Read more: "${title}"`}
                        >
                          Read more &rarr;
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      </div>
      {posts.length > MAX_DISPLAY && (
        <div className="flex justify-end text-base leading-6 font-medium">
          <Link
            href="/blog"
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
            aria-label="All posts"
          >
            All Posts &rarr;
          </Link>
        </div>
      )}
      {siteMetadata.newsletter?.provider && (
        <div className="flex items-center justify-center pt-4">
          <NewsletterForm />
        </div>
      )}
    </>
  )
}
