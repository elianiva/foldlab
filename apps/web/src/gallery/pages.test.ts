import { expect, test } from 'vitest'
import { galleryPages } from './pages.ts'

// The sidebar links, the route lookup and the overview keys all use these two
// fields. A duplicate makes one page unreachable and gives two overview cells
// the same key, so keep them unique.
test('every gallery page has a unique id and title', () => {
  const ids = galleryPages.map((page) => page.id)
  const titles = galleryPages.map((page) => page.title)
  expect(ids.toSorted()).toEqual([...new Set(ids)].toSorted())
  expect(titles.toSorted()).toEqual([...new Set(titles)].toSorted())
})
