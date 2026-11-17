// Pages for elements that need no behavior. The code under each preview is the
// call that produced it.
import { Elements as E, Meter, Pagination } from '@foldlab/ui'
import { css } from '../../styled-system/css'
import { Message } from '../app/main.ts'
import { sectionOf, stacked } from './layout.ts'
import type { Page } from './types.ts'

const meterHeaderCls = css({
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '0.85rem',
})
const pagerCls = css({ display: 'flex', gap: '0.25rem', margin: 0, padding: 0, listStyle: 'none' })
const code = (...lines: ReadonlyArray<string>) => lines.join('\n')

export const staticPages: ReadonlyArray<Page> = [
  {
    id: 'badge',
    title: 'Badge',
    description: 'A short status label.',
    render: ({ h }) => [
      sectionOf(
        h,
        'Tones',
        (['neutral', 'info', 'success', 'warning', 'error'] as const).map((tone) =>
          E.badge(h, tone, [tone]),
        ),
        "E.badge(h, 'success', ['success'])",
      ),
    ],
  },
  {
    id: 'banner',
    title: 'Banner',
    description: 'A message that sits above the content it concerns.',
    render: ({ h }) => [
      sectionOf(
        h,
        'Tones',
        [
          E.banner(h, { tone: 'info', title: 'Heads up' }, ['A new version is available.']),
          E.banner(h, { tone: 'success', title: 'Deployed' }, ['Your worker is live.']),
          E.banner(h, { tone: 'warning', title: 'Quota' }, ['You have used 90% of your requests.']),
          E.banner(h, { tone: 'error', title: 'Failed' }, ['The build could not be completed.']),
        ],
        "E.banner(h, { tone: 'warning', title: 'Quota' }, ['You have used 90%.'])",
        stacked,
      ),
    ],
  },
  {
    id: 'breadcrumbs',
    title: 'Breadcrumbs',
    description: 'Shows where the current page sits in a hierarchy.',
    render: ({ h }) => [
      sectionOf(
        h,
        'Basic',
        [
          E.breadcrumbs(h, [
            { label: 'Home', href: '#/button' },
            { label: 'Workers', href: '#/table' },
            { label: 'my-worker' },
          ]),
        ],
        "E.breadcrumbs(h, [{ label: 'Home', href: '#/' }, { label: 'my-worker' }])",
      ),
    ],
  },
  {
    id: 'button',
    title: 'Button',
    description: 'Displays a button or a component that looks like a button.',
    render: ({ h, model }) => [
      sectionOf(
        h,
        'Variants',
        (['primary', 'secondary', 'ghost', 'destructive'] as const).map((variant) =>
          E.button(h, { variant }, [], [variant]),
        ),
        "E.button(h, { variant: 'primary' }, [], ['Create Worker'])",
      ),
      sectionOf(
        h,
        'Sizes',
        (['sm', 'base', 'lg'] as const).map((size) => E.button(h, { size }, [], [size])),
      ),
      sectionOf(
        h,
        'Icon only',
        [
          E.button(h, { shape: 'square' }, [h.AriaLabel('Add')], ['+']),
          E.button(h, { shape: 'square', variant: 'primary' }, [h.AriaLabel('Add')], ['+']),
          E.button(h, { shape: 'square', size: 'sm' }, [h.AriaLabel('Close')], ['\u00d7']),
        ],
        "E.button(h, { shape: 'square' }, [h.AriaLabel('Add')], ['+'])",
      ),
      sectionOf(
        h,
        'Loading state',
        [
          E.button(
            h,
            { variant: 'primary', loading: model.demo.loading },
            [h.OnClick(Message.ToggledLoading())],
            ['Create Worker'],
          ),
        ],
        code(
          'E.button(h, { variant: "primary", loading: model.demo.loading },',
          '  [h.OnClick(Message.ToggledLoading())], ["Create Worker"])',
        ),
      ),
      sectionOf(h, 'Disabled state', [E.button(h, { disabled: true }, [], ['Disabled'])]),
    ],
  },
  {
    id: 'button-group',
    title: 'Button Group',
    description: 'Joins related buttons into one control.',
    render: ({ h }) => [
      sectionOf(
        h,
        'Basic',
        [
          E.buttonGroup(h, [
            E.button(h, { variant: 'primary' }, [], ['Deploy']),
            E.button(h, { shape: 'square' }, [h.AriaLabel('More options')], ['\u25be']),
          ]),
          E.buttonGroup(h, [
            E.button(h, {}, [], ['Day']),
            E.button(h, {}, [], ['Week']),
            E.button(h, {}, [], ['Month']),
          ]),
        ],
        "E.buttonGroup(h, [E.button(h, {}, [], ['Day']), E.button(h, {}, [], ['Week'])])",
      ),
    ],
  },
  {
    id: 'empty',
    title: 'Empty',
    description: 'Fills a space that has no content yet.',
    render: ({ h }) => [
      sectionOf(
        h,
        'With action',
        [
          E.empty(
            h,
            { title: 'No workers yet', description: 'Create a worker to see it here.' },
            E.button(h, { variant: 'primary' }, [], ['Create Worker']),
          ),
        ],
        "E.empty(h, { title: 'No workers yet' }, E.button(h, {}, [], ['Create']))",
        stacked,
      ),
    ],
  },
  {
    id: 'input',
    title: 'Input',
    description: 'A text field. Pair it with a Label, or use Field for error wiring.',
    render: ({ h }) => [
      sectionOf(
        h,
        'Sizes',
        (['sm', 'base', 'lg'] as const).map((size) =>
          E.input(h, { size, placeholder: `${size} input` }, [h.Value('')]),
        ),
        "E.input(h, { size: 'lg', placeholder: 'lg input' }, [])",
        stacked,
      ),
      sectionOf(
        h,
        'States',
        [
          E.input(h, { invalid: true, placeholder: 'Invalid' }, [h.Value('')]),
          E.input(h, { disabled: true, placeholder: 'Disabled' }, [h.Value('')]),
        ],
        undefined,
        stacked,
      ),
    ],
  },
  {
    id: 'label',
    title: 'Label',
    description: 'Names a control.',
    render: ({ h }) => [
      sectionOf(
        h,
        'With input',
        [
          h.div(
            [],
            [
              E.label(h, { for: 'label-demo', required: true }, ['Worker name']),
              E.input(h, { placeholder: 'my-worker' }, [h.Id('label-demo'), h.Value('')]),
            ],
          ),
        ],
        "E.label(h, { for: 'name', required: true }, ['Worker name'])",
        stacked,
      ),
    ],
  },
  {
    id: 'layer-card',
    title: 'Layer Card',
    description: 'A raised surface that groups content.',
    render: ({ h }) => [
      sectionOf(
        h,
        'Basic',
        [
          E.layerCard(h, [
            E.text(h, 'heading3', ['Usage']),
            E.text(h, 'secondary', ['1.2M requests in the last 30 days.']),
          ]),
        ],
        "E.layerCard(h, [E.text(h, 'heading3', ['Usage'])])",
        stacked,
      ),
    ],
  },
  {
    id: 'link',
    title: 'Link',
    description: 'Navigates somewhere. Renders a real anchor.',
    render: ({ h }) => [
      sectionOf(
        h,
        'Variants',
        [E.link(h, '#/button', ['Default link']), E.link(h, '#/button', ['Plain link'], 'plain')],
        "E.link(h, '#/button', ['Default link'])",
      ),
    ],
  },
  {
    id: 'loader',
    title: 'Loader',
    description: 'Shows that something is in progress.',
    render: ({ h }) => [
      sectionOf(
        h,
        'Sizes',
        (['sm', 'base', 'lg'] as const).map((size) => E.loader(h, size)),
        "E.loader(h, 'lg')",
      ),
    ],
  },
  {
    id: 'meter',
    title: 'Meter',
    description: 'A value inside a known range.',
    render: ({ h, model, ui }) => {
      const row = (state: typeof model.ui.meterCpu, label: string) => {
        const m = Meter.parts(state, h, ui)
        const percent = Math.round(((state.value - state.min) / (state.max - state.min)) * 100)
        return m.root(
          {},
          [h.AriaLabel(label)],
          [
            h.div(
              [h.Class(meterHeaderCls)],
              [m.label({}, [], [label]), m.value({}, [], [`${percent}%`])],
            ),
            m.track({}, [], [m.indicator({}, [], [])]),
          ],
        )
      }
      return [
        sectionOf(
          h,
          'Basic',
          [row(model.ui.meterCpu, 'CPU'), row(model.ui.meterMemory, 'Memory')],
          'const m = Meter.parts(state, h, ui)\nm.root({}, [], [m.label({}, [], [label]), m.value({}, [], [text]), m.track({}, [], [m.indicator({}, [], [])])])',
          stacked,
        ),
      ]
    },
  },
  {
    id: 'pagination',
    title: 'Pagination',
    description: 'Moves between pages of a long list. State lives in the Model.',
    render: ({ h, model, ui }) => {
      const pg = Pagination.parts(model.ui.pages, h, ui)
      const items = Pagination.paginationRange({
        page: model.ui.pages.page,
        pageCount: model.ui.pages.pageCount,
      })
      return [
        sectionOf(
          h,
          'Basic',
          [
            pg.root(
              {},
              [h.AriaLabel('Pagination')],
              [
                pg.list(
                  {},
                  [h.Class(pagerCls)],
                  [
                    pg.item({}, [], [pg.previous({}, [], ['\u2039'])]),
                    ...items.map((entry, index) =>
                      typeof entry === 'number'
                        ? pg.item(
                            {},
                            [h.Key(`p${entry}`)],
                            [pg.link({ page: entry, id: String(entry) }, [], [String(entry)])],
                          )
                        : pg.item({}, [h.Key(`e${index}`)], [pg.ellipsis({}, [], ['\u2026'])]),
                    ),
                    pg.item({}, [], [pg.next({}, [], ['\u203a'])]),
                  ],
                ),
              ],
            ),
          ],
          'const pg = Pagination.parts(state, h, ui)\\npg.root({}, [], [pg.list({}, [], [pg.item({}, [], [pg.link({ page }, [], [label])])])])',
        ),
      ]
    },
  },
  {
    id: 'skeleton-line',
    title: 'Skeleton Line',
    description: 'A placeholder for text that is still loading.',
    render: ({ h }) => [
      sectionOf(
        h,
        'Basic',
        [E.skeletonLine(h, '100%'), E.skeletonLine(h, '80%'), E.skeletonLine(h, '55%')],
        "E.skeletonLine(h, '80%')",
        stacked,
      ),
    ],
  },
  {
    id: 'table',
    title: 'Table',
    description: 'Rows and columns of data.',
    render: ({ h }) => [
      sectionOf(
        h,
        'Basic',
        [
          E.table(
            h,
            ['Worker', 'Status', 'Requests'],
            [
              ['api-gateway', E.badge(h, 'success', ['Live']), '1.2M'],
              ['image-resizer', E.badge(h, 'warning', ['Degraded']), '340K'],
              ['legacy-cron', E.badge(h, 'neutral', ['Paused']), '0'],
            ],
          ),
        ],
        "E.table(h, ['Worker', 'Status'], [['api-gateway', E.badge(h, 'success', ['Live'])]])",
        stacked,
      ),
    ],
  },
  {
    id: 'text',
    title: 'Text',
    description: 'Typographic variants.',
    render: ({ h }) => [
      sectionOf(
        h,
        'Variants',
        (['heading1', 'heading2', 'heading3', 'body', 'secondary', 'mono'] as const).map(
          (variant) => E.text(h, variant, [`${variant} \u2014 The quick brown fox`]),
        ),
        "E.text(h, 'heading2', ['Title'])",
        stacked,
      ),
    ],
  },
]
