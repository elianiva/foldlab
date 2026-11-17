// More pages: static elements, and the adapter components that already existed
// (accordion, combobox, dialog), laid out as gallery pages.
import { Accordion, Combobox, Dialog, Elements as E } from '@foldlab/ui'
import type { Html } from 'foldkit/html'
import { Message } from '../app/main.ts'
import { sectionOf, stacked } from './layout.ts'
import type { Ctx, Page } from './types.ts'

const accordionPage = ({ h, model, ui }: Ctx): ReadonlyArray<Html> => {
  const a = Accordion.parts(model.ui.help, h, ui)
  const item = (value: string, title: string, body: string) =>
    a.item(
      { value },
      [],
      [
        a.header({}, [], [a.trigger({ value }, [], [title])]),
        a.panel({ value }, [], [h.p([], [body])]),
      ],
    )
  return [
    sectionOf(
      h,
      'Multiple open',
      [
        a.root(
          {},
          [],
          [
            item('names', 'Why is my name taken?', 'Names are unique across projects.'),
            item('dates', 'Date rules', 'The end date must not be before the start date.'),
          ],
        ),
      ],
      'a.root({}, [], [a.item({ value }, [], [a.header({}, [], [a.trigger({ value }, [], [title])]),\n  a.panel({ value }, [], [h.p([], [body])])])])',
      stacked,
    ),
  ]
}

const comboboxPage = ({ h, model, ui }: Ctx): ReadonlyArray<Html> => {
  const box = Combobox.parts(model.ui.assigneeBox, h, ui)
  const visible = Combobox.visibleItems(model.ui.assigneeBox)
  return [
    sectionOf(
      h,
      'Searchable list',
      [
        box.root(
          {},
          [],
          [
            box.label({}, [], ['Assignee']),
            box.input({}, [h.Placeholder('Search people')], []),
            box.content(
              {},
              [],
              [
                box.list(
                  {},
                  [],
                  visible.length === 0
                    ? [box.empty({}, [], ['No matches'])]
                    : visible.map((item) =>
                        box.item(
                          { value: item.value, label: item.label },
                          [],
                          [box['item-text']({ text: item.label }, [], [item.label])],
                        ),
                      ),
                ),
              ],
            ),
          ],
        ),
      ],
      "box.root({}, [], [box.label(...), box.input({}, [h.Placeholder('Search')], []),\n  box.content({}, [], [box.list({}, [], Combobox.visibleItems(state).map(...))])])",
      stacked,
    ),
  ]
}

const dialogPage = ({ h, model, ui }: Ctx): ReadonlyArray<Html> => {
  const d = Dialog.parts(model.ui.settings, h, ui)
  const c = Dialog.parts(model.ui.confirm, h, ui)
  return [
    sectionOf(
      h,
      'Nested dialogs',
      [
        d.trigger({}, [], ['Open dialog']),
        d.backdrop({}, [], []),
        d.content(
          {},
          [],
          [
            d.title({}, [], ['Project settings']),
            d.description({}, [], ['Press Escape to close. Tab stays inside.']),
            c.trigger({}, [], ['Delete project']),
            c.backdrop({}, [], []),
            c.content({}, [], [c.title({}, [], ['Delete project?']), c.close({}, [], ['Cancel'])]),
            d.close({}, [], ['Close']),
          ],
        ),
      ],
      "d.trigger({}, [], ['Open']), d.backdrop({}, [], []),\nd.content({}, [], [d.title(...), d.close({}, [], ['Close'])])",
    ),
  ]
}

const tocItems = [
  { id: 'installation', label: 'Installation' },
  { id: 'usage', label: 'Usage' },
  { id: 'examples', label: 'Examples' },
  { id: 'variants', label: 'Variants', level: 1 },
  { id: 'api', label: 'API Reference' },
]

const copyPage =
  (inline: boolean): Page['render'] =>
  ({ h, model }) => {
    const text = inline ? 'pnpm add @foldlab/ui' : 'pnpm dlx foldlab init --template=cafe'
    return [
      sectionOf(
        h,
        inline ? 'Inline' : 'Block',
        [
          E.copyText(
            h,
            { text, copied: model.demo.copied === text, inline },
            h.OnClick(Message.ClickedCopy({ text })),
          ),
        ],
        'E.copyText(h, { text, copied }, h.OnClick(Message.ClickedCopy({ text })))',
        inline ? undefined : stacked,
      ),
    ]
  }

export const morePages: ReadonlyArray<Page> = [
  {
    id: 'clipboard-text',
    title: 'Clipboard Text',
    description: 'A value with a button that copies it. The copy is a Command.',
    render: copyPage(false),
  },
  {
    id: 'inline-copy-text',
    title: 'Inline Copy Text',
    description: 'The same, sized to sit in a sentence.',
    render: copyPage(true),
  },
  {
    id: 'table-of-contents',
    title: 'Table of Contents',
    description: 'Links to the sections of a page.',
    render: ({ h }) => [
      sectionOf(
        h,
        'Basic',
        [E.tableOfContents(h, tocItems, 'usage')],
        "E.tableOfContents(h, items, 'usage')",
      ),
    ],
  },
  {
    id: 'sidebar',
    title: 'Sidebar',
    description: 'Grouped navigation links.',
    render: ({ h }) => [
      sectionOf(
        h,
        'Basic',
        [
          E.sidebar(h, [
            {
              name: 'Build',
              items: [
                { label: 'Workers', href: '#/sidebar', current: true },
                { label: 'Pages', href: '#/sidebar' },
              ],
            },
            {
              name: 'Storage',
              items: [
                { label: 'KV', href: '#/sidebar' },
                { label: 'D1', href: '#/sidebar' },
              ],
            },
          ]),
        ],
        "E.sidebar(h, [{ name: 'Build', items: [{ label: 'Workers', href }] }])",
      ),
    ],
  },
  {
    id: 'flow',
    title: 'Flow',
    description: 'Boxes joined by arrows.',
    render: ({ h }) => [
      sectionOf(
        h,
        'Basic',
        [
          E.flow(h, [
            E.flowNode(h, { title: 'Request' }),
            E.flowArrow(h),
            E.flowNode(h, { title: 'Worker', tone: 'success' }),
            E.flowArrow(h),
            E.flowNode(h, { title: 'D1' }),
          ]),
        ],
        "E.flow(h, [E.flowNode(h, { title: 'Request' }), E.flowArrow(h), ...])",
      ),
    ],
  },
  {
    id: 'page-header',
    title: 'Page Header',
    description: 'A title with its actions. A building block.',
    render: ({ h }) => [
      sectionOf(
        h,
        'Block',
        [
          E.pageHeader(h, { title: 'Workers', description: 'Deploy code to the edge.' }, [
            E.button(h, { variant: 'primary' }, [], ['Create Worker']),
          ]),
        ],
        "E.pageHeader(h, { title: 'Workers' }, [E.button(h, { variant: 'primary' }, [], ['Create'])])",
        stacked,
      ),
    ],
  },
  {
    id: 'resource-list',
    title: 'Resource List',
    description: 'Rows of named resources with a status. A building block.',
    render: ({ h }) => [
      sectionOf(
        h,
        'Block',
        [
          E.resourceList(h, [
            {
              name: 'api-gateway',
              meta: 'Updated 2h ago',
              status: E.badge(h, 'success', ['Live']),
            },
            {
              name: 'image-resizer',
              meta: 'Updated 1d ago',
              status: E.badge(h, 'warning', ['Degraded']),
            },
          ]),
        ],
        "E.resourceList(h, [{ name, meta, status: E.badge(h, 'success', ['Live']) }])",
        stacked,
      ),
    ],
  },

  {
    id: 'accordion',
    title: 'Accordion',
    description: 'Stacked sections that expand one at a time or together.',
    render: accordionPage,
  },
  {
    id: 'combobox',
    title: 'Combobox',
    description:
      'A text input with a filtered list. The app filters, so it decides which items exist.',
    render: comboboxPage,
  },
  {
    id: 'dialog',
    title: 'Dialog',
    description: 'A window over the page that makes everything behind it inert.',
    render: dialogPage,
  },
  {
    id: 'grid',
    title: 'Grid',
    description: 'Lays children out in equal columns.',
    render: ({ h }) => [
      sectionOf(
        h,
        'Three columns',
        [
          E.grid(
            h,
            { columns: 3 },
            ['One', 'Two', 'Three', 'Four', 'Five', 'Six'].map((text) =>
              E.layerCard(h, [E.text(h, 'body', [text])]),
            ),
          ),
        ],
        'E.grid(h, { columns: 3 }, cards)',
        stacked,
      ),
    ],
  },
  {
    id: 'toolbar',
    title: 'Toolbar',
    description: 'Groups related actions.',
    render: ({ h }) => [
      sectionOf(
        h,
        'Basic',
        [
          E.toolbar(h, [
            E.button(h, { variant: 'ghost', size: 'sm' }, [], ['Bold']),
            E.button(h, { variant: 'ghost', size: 'sm' }, [], ['Italic']),
            E.button(h, { variant: 'ghost', size: 'sm' }, [], ['Link']),
          ]),
        ],
        "E.toolbar(h, [E.button(h, { variant: 'ghost', size: 'sm' }, [], ['Bold'])])",
      ),
    ],
  },
  {
    id: 'input-area',
    title: 'Input Area',
    description: 'A multi-line text field.',
    render: ({ h }) => [
      sectionOf(
        h,
        'Basic',
        [E.inputArea(h, { placeholder: 'Describe the change', rows: 4 }, [h.Value('')])],
        "E.inputArea(h, { placeholder: 'Describe the change', rows: 4 }, [])",
        stacked,
      ),
    ],
  },
  {
    id: 'input-group',
    title: 'Input Group',
    description: 'An input joined to an action.',
    render: ({ h }) => [
      sectionOf(
        h,
        'With button',
        [
          E.inputGroup(h, [
            E.input(h, { placeholder: 'you@example.com', type: 'email' }, [h.Value('')]),
            E.button(h, { variant: 'primary' }, [], ['Subscribe']),
          ]),
        ],
        "E.inputGroup(h, [E.input(h, {}, []), E.button(h, { variant: 'primary' }, [], ['Subscribe'])])",
        stacked,
      ),
    ],
  },
  {
    id: 'sensitive-input',
    title: 'Sensitive Input',
    description: 'A secret that stays hidden until you reveal it. State lives in the Model.',
    render: ({ h, model }) => [
      sectionOf(
        h,
        'Reveal toggle',
        [
          E.inputGroup(h, [
            E.input(h, { type: model.demo.revealed ? 'text' : 'password' }, [
              h.Value('sk-live-4f9a2c'),
              h.Attribute('readonly', ''),
            ]),
            E.button(
              h,
              {},
              [h.OnClick(Message.ToggledReveal())],
              [model.demo.revealed ? 'Hide' : 'Show'],
            ),
          ]),
        ],
        "E.input(h, { type: model.demo.revealed ? 'text' : 'password' }, [h.Value(secret)])",
        stacked,
      ),
    ],
  },
  {
    id: 'code',
    title: 'Code',
    description: 'A block of source.',
    render: ({ h }) => [
      sectionOf(
        h,
        'Block',
        [E.code(h, 'const kit = Ui.define({ dialog: Dialog.component })\nawait deploy(kit)')],
        'E.code(h, source)',
        stacked,
      ),
    ],
  },
]
