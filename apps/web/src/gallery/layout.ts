import type { Html, HtmlBuilder } from 'foldkit/html'
import { css } from '../../styled-system/css'

const shellCls = css({ display: 'grid', gridTemplateColumns: '16.5rem 1fr', minHeight: '100vh' })
const sidebarCls = css({
  position: 'sticky',
  top: 0,
  alignSelf: 'start',
  height: '100vh',
  overflowY: 'auto',
  padding: '1.25rem 0.9rem',
  borderRight: '1px solid var(--fl-border)',
  background: 'var(--fl-surface)',
})
const brandCls = css({ fontSize: '1.05rem', fontWeight: 650, padding: '0 0.6rem 1rem' })
const groupCls = css({
  fontSize: '0.72rem',
  fontWeight: 600,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'var(--fl-muted)',
  padding: '1rem 0.6rem 0.4rem',
})
const navLinkCls = css({
  display: 'block',
  padding: '0.35rem 0.6rem',
  borderRadius: '6px',
  color: 'var(--fl-muted)',
  fontSize: '0.92rem',
  textDecoration: 'none',
  '&:hover': { background: '#f1f2f5', color: 'var(--fl-text)' },
  '&[aria-current="page"]': {
    background: 'var(--fl-accent-soft)',
    color: 'var(--fl-accent)',
    fontWeight: 550,
  },
})
const mainCls = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
  width: '100%',
  maxWidth: '52rem',
  padding: '2.5rem 2.5rem 5rem',
})
const headerCls = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.4rem',
  paddingBottom: '0.5rem',
})
const titleCls = css({ fontSize: '2rem', fontWeight: 650, letterSpacing: '-0.02em', margin: 0 })
const leadCls = css({ margin: 0, color: 'var(--fl-muted)', fontSize: '1.02rem' })
const cardCls = css({
  border: '1px solid var(--fl-border)',
  borderRadius: '12px',
  background: 'var(--fl-surface)',
  overflow: 'hidden',
})
const cardTitleCls = css({
  margin: 0,
  padding: '0.85rem 1.1rem 0',
  fontSize: '0.95rem',
  fontWeight: 600,
})
const previewCls = css({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.75rem',
  padding: '2rem 1.1rem',
})
const codeCls = css({
  margin: 0,
  padding: '0.9rem 1.1rem',
  borderTop: '1px solid var(--fl-border)',
  background: '#fafbfc',
  fontFamily: 'ui-monospace, "SF Mono", monospace',
  fontSize: '0.8rem',
  lineHeight: 1.6,
  overflowX: 'auto',
})

export const sectionOf = <M>(
  h: HtmlBuilder<M>,
  title: string,
  preview: ReadonlyArray<Html | string>,
  code?: string,
  previewClass = previewCls,
): Html =>
  h.section(
    [h.Class(cardCls)],
    [
      h.h3([h.Class(cardTitleCls)], [title]),
      h.div([h.Class(previewClass)], preview),
      code === undefined ? null : h.pre([h.Class(codeCls)], [h.code([], [code])]),
    ],
  )

/** A preview that stacks its children and uses the card's full width. */
export const stacked = css({
  flexDirection: 'column',
  alignItems: 'stretch',
  justifyContent: 'flex-start',
})

export type NavEntry = Readonly<{ id: string; title: string }>

export const shell = <M>(
  h: HtmlBuilder<M>,
  props: Readonly<{
    current: string
    groups: ReadonlyArray<Readonly<{ name: string; entries: ReadonlyArray<NavEntry> }>>
    title: string
    description: string
  }>,
  content: ReadonlyArray<Html | string>,
): Html =>
  h.div(
    [h.Class(shellCls)],
    [
      h.aside(
        [h.Class(sidebarCls)],
        [
          h.div([h.Class(brandCls)], ['Foldlab']),
          h.nav(
            [h.AriaLabel('Components')],
            props.groups.flatMap((group) => [
              h.div([h.Class(groupCls)], [group.name]),
              ...group.entries.map((entry) =>
                h.a(
                  [
                    h.Class(navLinkCls),
                    h.Href(`#/${entry.id}`),
                    ...(entry.id === props.current ? [h.AriaCurrent('page')] : []),
                  ],
                  [entry.title],
                ),
              ),
            ]),
          ),
        ],
      ),
      h.main(
        [h.Class(mainCls)],
        [
          h.header(
            [h.Class(headerCls)],
            [
              h.h1([h.Class(titleCls)], [props.title]),
              h.p([h.Class(leadCls)], [props.description]),
            ],
          ),
          ...content,
        ],
      ),
    ],
  )
