import type { Html } from 'foldkit/html'
import { css } from '../../styled-system/css'
import { AppRoute, pathOf } from '../app/route.ts'
import type { Ctx, Page } from './types.ts'

const gridCls = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(19rem, 1fr))',
  margin: '0 -2.5rem',
  borderTop: '1px solid var(--hairline)',
})
const cellCls = css({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  minHeight: '15rem',
  maxHeight: '24rem',
  overflow: 'hidden',
  borderRight: '1px solid var(--hairline)',
  borderBottom: '1px solid var(--hairline)',
})
const cellTitleCls = css({
  alignSelf: 'flex-start',
  padding: '1rem 1.2rem 0',
  fontSize: '0.85rem',
  color: 'var(--muted-foreground)',
  textDecoration: 'none',
  '&:hover': { color: 'var(--foreground)' },
})
// Each cell shows a page's first section as it is: the card, its title and its code are
// dropped, and the preview keeps its live parts.
const bodyCls = css({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1rem',
  '& [data-slot="section"]': {
    width: '100%',
    background: 'transparent',
    boxShadow: 'none',
    borderRadius: 0,
    overflow: 'visible',
  },
  '& [data-slot="section-title"], & [data-slot="section-code"]': { display: 'none' },
  '& [data-slot="section-preview"]': { padding: 0, justifyContent: 'center' },
})

/** Every component in a grid, as Kumo's home page does: a title and the live part in each cell. */
export const overviewPage = (ctx: Ctx, pages: ReadonlyArray<Page>): ReadonlyArray<Html> => {
  const { h } = ctx
  return [
    h.div(
      [h.Class(gridCls), h.Attribute('data-slot', 'overview')],
      pages.map((page) =>
        h.div(
          [h.Key(page.id), h.Class(cellCls), h.Attribute('data-slot', 'overview-cell')],
          [
            h.a(
              [h.Class(cellTitleCls), h.Href(pathOf(AppRoute.Component({ id: page.id })))],
              [page.title],
            ),
            h.div([h.Class(bodyCls)], page.render(ctx).slice(0, 1)),
          ],
        ),
      ),
    ),
  ]
}
