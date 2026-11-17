// Elements that need no behavior: a styled element is a `data-slot` and a few
// `data-*` variants, and the theme does the rest. They are plain functions of
// `h`, with no ui-sdk instance and no Mount, so they cost nothing at runtime and
// work in a Scene test as they are. Foldkit events (`h.OnClick`) go in through
// `attributes`; these elements have no core handler to collide with.
import type { Attribute, Html, HtmlBuilder, TextareaAttribute } from 'foldkit/html'

type Children = ReadonlyArray<Html | string>
type Attrs<M> = ReadonlyArray<Attribute<M>>

const data = <M>(
  h: HtmlBuilder<M>,
  slot: string,
  variants: Readonly<Record<string, string | boolean | undefined>> = {},
): Attrs<M> => [
  h.Attribute('data-slot', slot),
  ...Object.entries(variants).flatMap(([name, value]) =>
    value === undefined || value === false
      ? []
      : [h.Attribute(`data-${name}`, value === true ? '' : value)],
  ),
]

export type ButtonProps = Readonly<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'sm' | 'base' | 'lg'
  shape?: 'base' | 'square'
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit'
}>

export const loader = <M>(h: HtmlBuilder<M>, size: 'sm' | 'base' | 'lg' = 'base'): Html =>
  h.span([...data(h, 'loader', { size }), h.Role('status'), h.AriaLabel('Loading')], [])

export const button = <M>(
  h: HtmlBuilder<M>,
  props: ButtonProps,
  attributes: Attrs<M>,
  children: Children,
): Html =>
  h.button(
    [
      ...data(h, 'button', {
        variant: props.variant ?? 'secondary',
        size: props.size ?? 'base',
        shape: props.shape,
        loading: props.loading,
      }),
      h.Type(props.type ?? 'button'),
      ...(props.disabled === true || props.loading === true ? [h.Disabled(true)] : []),
      ...(props.loading === true ? [h.AriaBusy(true)] : []),
      ...attributes,
    ],
    props.loading === true ? [loader(h, 'sm'), ...children] : children,
  )

export const buttonGroup = <M>(h: HtmlBuilder<M>, children: Children): Html =>
  h.div([...data(h, 'button-group'), h.Role('group')], children)

export type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'error'

export const badge = <M>(h: HtmlBuilder<M>, tone: Tone, children: Children): Html =>
  h.span(data(h, 'badge', { tone }), children)

export const banner = <M>(
  h: HtmlBuilder<M>,
  props: Readonly<{ tone?: Tone; title?: string }>,
  children: Children,
): Html =>
  h.div(
    [...data(h, 'banner', { tone: props.tone ?? 'info' }), h.Role('status')],
    [
      ...(props.title === undefined ? [] : [h.p(data(h, 'banner-title'), [props.title])]),
      h.div(data(h, 'banner-body'), children),
    ],
  )

export const breadcrumbs = <M>(
  h: HtmlBuilder<M>,
  items: ReadonlyArray<Readonly<{ label: string; href?: string }>>,
): Html =>
  h.nav(
    [...data(h, 'breadcrumbs'), h.AriaLabel('Breadcrumb')],
    [
      h.ol(
        [],
        items.map((item, index) =>
          h.li(index === items.length - 1 ? [h.AriaCurrent('page')] : [], [
            item.href === undefined || index === items.length - 1
              ? item.label
              : link(h, item.href, [item.label]),
          ]),
        ),
      ),
    ],
  )

export const empty = <M>(
  h: HtmlBuilder<M>,
  props: Readonly<{ title: string; description?: string }>,
  action: Html = null,
): Html =>
  h.div(data(h, 'empty'), [
    h.p(data(h, 'empty-title'), [props.title]),
    ...(props.description === undefined
      ? []
      : [h.p(data(h, 'empty-description'), [props.description])]),
    action,
  ])

export const label = <M>(
  h: HtmlBuilder<M>,
  props: Readonly<{ for: string; required?: boolean }>,
  children: Children,
): Html => h.label([...data(h, 'label', { required: props.required }), h.For(props.for)], children)

export type InputProps = Readonly<{
  size?: 'sm' | 'base' | 'lg'
  invalid?: boolean
  disabled?: boolean
  type?: string
  placeholder?: string
}>

export const input = <M>(h: HtmlBuilder<M>, props: InputProps, attributes: Attrs<M>): Html =>
  h.input([
    ...data(h, 'input', { size: props.size ?? 'base', invalid: props.invalid }),
    h.Type(props.type ?? 'text'),
    ...(props.placeholder === undefined ? [] : [h.Placeholder(props.placeholder)]),
    ...(props.invalid === true ? [h.AriaInvalid(true)] : []),
    ...(props.disabled === true ? [h.Disabled(true)] : []),
    ...attributes,
  ])

export const link = <M>(
  h: HtmlBuilder<M>,
  href: string,
  children: Children,
  variant: 'default' | 'plain' = 'default',
): Html => h.a([...data(h, 'link', { variant }), h.Href(href)], children)

export const skeletonLine = <M>(h: HtmlBuilder<M>, width = '100%'): Html =>
  h.span([...data(h, 'skeleton-line'), h.Style({ width })], [])

export type TextVariant = 'heading1' | 'heading2' | 'heading3' | 'body' | 'secondary' | 'mono'

export const text = <M>(h: HtmlBuilder<M>, variant: TextVariant, children: Children): Html =>
  (variant === 'heading1'
    ? h.h1
    : variant === 'heading2'
      ? h.h2
      : variant === 'heading3'
        ? h.h3
        : h.p)(data(h, 'text', { variant }), children)

export const layerCard = <M>(h: HtmlBuilder<M>, children: Children): Html =>
  h.div(data(h, 'layer-card'), children)

export const table = <M>(
  h: HtmlBuilder<M>,
  headers: ReadonlyArray<string>,
  rows: ReadonlyArray<ReadonlyArray<Html | string>>,
): Html =>
  h.div(data(h, 'table'), [
    h.table(
      [],
      [
        h.thead(
          [],
          [
            h.tr(
              [],
              headers.map((header) => h.th([h.Scope('col')], [header])),
            ),
          ],
        ),
        h.tbody(
          [],
          rows.map((row) =>
            h.tr(
              [],
              row.map((cell) => h.td([], [cell])),
            ),
          ),
        ),
      ],
    ),
  ])

export const meter = <M>(
  h: HtmlBuilder<M>,
  props: Readonly<{ value: number; max?: number; label: string }>,
): Html => {
  const max = props.max ?? 100
  const percent = Math.max(0, Math.min(100, (props.value / max) * 100))
  return h.div(
    [
      ...data(h, 'meter'),
      h.Role('meter'),
      h.AriaLabel(props.label),
      h.AriaValuemin(0),
      h.AriaValuemax(max),
      h.AriaValuenow(props.value),
    ],
    [
      h.div(data(h, 'meter-label'), [
        h.span([], [props.label]),
        h.span([], [`${Math.round(percent)}%`]),
      ]),
      h.div(data(h, 'meter-track'), [
        h.div([...data(h, 'meter-indicator'), h.Style({ width: `${percent}%` })], []),
      ]),
    ],
  )
}

export const toolbar = <M>(h: HtmlBuilder<M>, children: Children): Html =>
  h.div([...data(h, 'toolbar'), h.Role('toolbar')], children)

export const grid = <M>(
  h: HtmlBuilder<M>,
  props: Readonly<{ columns?: number }>,
  children: Children,
): Html =>
  h.div(
    [...data(h, 'grid'), h.Style({ gridTemplateColumns: `repeat(${props.columns ?? 3}, 1fr)` })],
    children,
  )

export const inputArea = <M>(
  h: HtmlBuilder<M>,
  props: Readonly<{ placeholder?: string; rows?: number }>,
  attributes: ReadonlyArray<TextareaAttribute<M>>,
): Html =>
  h.textarea([
    h.Attribute('data-slot', 'input-area'),
    ...(props.placeholder === undefined ? [] : [h.Placeholder(props.placeholder)]),
    h.Rows(props.rows ?? 4),
    ...attributes,
  ])

export const inputGroup = <M>(h: HtmlBuilder<M>, children: Children): Html =>
  h.div([...data(h, 'input-group'), h.Role('group')], children)

export const code = <M>(h: HtmlBuilder<M>, source: string): Html =>
  h.pre(data(h, 'code'), [h.code([], [source])])
