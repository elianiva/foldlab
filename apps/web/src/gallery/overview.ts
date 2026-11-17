import type { Html, HtmlBuilder } from 'foldkit/html'
import { AppRoute, pathOf } from '../app/route.ts'
import type { Page } from './types.ts'

export const overviewPage = <M>(
  h: HtmlBuilder<M>,
  pages: ReadonlyArray<Page>,
): ReadonlyArray<Html> => [
  h.ul(
    [],
    pages.map((page) =>
      h.li([], [h.a([h.Href(pathOf(AppRoute.Component({ id: page.id })))], [page.title])]),
    ),
  ),
]
