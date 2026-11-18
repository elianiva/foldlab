import { staticPages } from './static-pages.ts'
import { extraPages } from './extra-pages.ts'
import { kitPages } from './kit-pages.ts'
import { morePages } from './more-pages.ts'
import { nativePages } from './native-pages.ts'
import { popupPages } from './popup-pages.ts'
import { formsPages } from './forms-pages.ts'
import { leafPages } from './leaf-pages.ts'
import { listPages } from './list-pages.ts'
import { uiPages } from './ui-pages.ts'
import type { Page } from './types.ts'

/** Every gallery page, in sidebar order. The project form and the overview have routes of their own. */
export const galleryPages: ReadonlyArray<Page> = [
  ...staticPages,
  ...uiPages,
  ...popupPages,
  ...morePages,
  ...kitPages,
  ...nativePages,
  ...extraPages,
  ...listPages,
  ...formsPages,
  ...leafPages,
].toSorted((a, b) => a.title.localeCompare(b.title))
