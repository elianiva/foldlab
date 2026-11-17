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
  borderRight: '1px solid var(--hairline)',
  background: 'var(--muted)',
})
const brandCls = css({
  fontFamily: 'var(--mono)',
  fontSize: '0.8rem',
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  padding: '0 0.6rem 1rem',
})
const groupCls = css({
  fontFamily: 'var(--mono)',
  fontSize: '0.68rem',
  fontWeight: 500,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--muted-foreground)',
  padding: '1rem 0.6rem 0.4rem',
})
const navLinkCls = css({
  display: 'block',
  padding: '0.35rem 0.6rem',
  borderRadius: '6px',
  color: 'var(--muted-foreground)',
  fontSize: '0.88rem',
  textDecoration: 'none',
  '&:hover': { background: 'var(--accent)', color: 'var(--foreground)' },
  '&[aria-current="page"]': {
    background: 'var(--raised-top)',
    boxShadow: 'var(--elev-raised)',
    color: 'var(--foreground)',
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
const wideMainCls = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
  width: '100%',
  padding: '2.5rem 2.5rem 0',
})
const headerCls = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.4rem',
  paddingBottom: '0.5rem',
})
const titleCls = css({ fontSize: '1.75rem', fontWeight: 600, letterSpacing: '-0.02em', margin: 0 })
const leadCls = css({ margin: 0, color: 'var(--fl-muted)', fontSize: '1.02rem' })
const cardCls = css({
  borderRadius: 'calc(var(--radius) * 1.8)',
  background: 'var(--card)',
  boxShadow: 'var(--elev-card)',
  overflow: 'hidden',
})
const cardTitleCls = css({
  margin: 0,
  padding: '0.9rem 1.1rem 0',
  fontFamily: 'var(--mono)',
  fontSize: '0.68rem',
  fontWeight: 500,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--muted-foreground)',
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
  borderTop: '1px solid var(--hairline-soft)',
  background: 'var(--surface-nested)',
  fontFamily: 'var(--mono)',
  fontSize: '0.75rem',
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
    [h.Class(cardCls), h.Attribute('data-slot', 'section')],
    [
      h.h3([h.Class(cardTitleCls), h.Attribute('data-slot', 'section-title')], [title]),
      h.div([h.Class(previewClass), h.Attribute('data-slot', 'section-preview')], preview),
      code === undefined
        ? null
        : h.pre([h.Class(codeCls), h.Attribute('data-slot', 'section-code')], [h.code([], [code])]),
    ],
  )

/** A full preview class (not a modifier) that stacks its children at the card's width. */
export const stacked = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  gap: '0.75rem',
  padding: '1.5rem 1.1rem',
})

export type NavEntry = Readonly<{ href: string; title: string }>

export const shell = <M>(
  h: HtmlBuilder<M>,
  props: Readonly<{
    current: string
    groups: ReadonlyArray<Readonly<{ name: string; entries: ReadonlyArray<NavEntry> }>>
    title: string
    description: string
    /** Lets the content use the full width, as the overview grid does. */
    wide?: boolean
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
                    h.Href(entry.href),
                    ...(entry.href === props.current ? [h.AriaCurrent('page')] : []),
                  ],
                  [entry.title],
                ),
              ),
            ]),
          ),
        ],
      ),
      h.main(
        [h.Class(props.wide === true ? wideMainCls : mainCls)],
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
