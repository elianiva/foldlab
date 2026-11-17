import { staticPages } from './static-pages.ts'
import { extraPages } from './extra-pages.ts'
import { kitPages } from './kit-pages.ts'
import { morePages } from './more-pages.ts'
import { popupPages } from './popup-pages.ts'
import { uiPages } from './ui-pages.ts'
import type { Page } from './types.ts'

/** Every gallery page, in sidebar order. The project form is not a gallery page: see `main.ts`. */
export const galleryPages: ReadonlyArray<Page> = [
  ...staticPages,
  ...uiPages,
  ...popupPages,
  ...morePages,
  ...kitPages,
  ...extraPages,
].toSorted((a, b) => a.title.localeCompare(b.title))

export const FORM_PAGE = 'form'
export const DEFAULT_PAGE = 'button'

/** A page id from a URL hash like `#/button`. Unknown ids fall back to the default. */
export const pageOfHash = (hash: string): string => {
  const id = hash.replace(/^#\/?/, '')
  return id === FORM_PAGE || galleryPages.some((page) => page.id === id) ? id : DEFAULT_PAGE
}
