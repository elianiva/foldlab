// Pages for the remaining behavior-free elements from foldcn.
import { Avatar, Elements as E, Progress, Separator } from '@foldlab/ui'
import { sectionOf, stacked } from './layout.ts'
import type { Page } from './types.ts'

export const extraPages: ReadonlyArray<Page> = [
  {
    id: 'alert',
    title: 'Alert',
    description: 'A callout for important information.',
    render: ({ h }) => [
      sectionOf(
        h,
        'Tones',
        [
          E.alert(h, { title: 'Heads up' }, ['You can add components with the CLI.']),
          E.alert(h, { tone: 'error', title: 'Error' }, ['Your session expired.']),
        ],
        "E.alert(h, { title: 'Heads up' }, ['...'])",
        stacked,
      ),
    ],
  },
  {
    id: 'aspect-ratio',
    title: 'Aspect Ratio',
    description: 'Keeps content at a fixed ratio.',
    render: ({ h }) => [
      sectionOf(
        h,
        '16 / 9',
        [E.aspectRatio(h, '16 / 9', ['16 / 9'])],
        "E.aspectRatio(h, '16 / 9', children)",
        stacked,
      ),
    ],
  },
  {
    id: 'card',
    title: 'Card',
    description: 'A titled container with an optional footer.',
    render: ({ h }) => [
      sectionOf(
        h,
        'With footer',
        [
          E.card(
            h,
            { title: 'Create project', description: 'Deploy in one click.' },
            [E.text(h, 'body', ['Name your project to get started.'])],
            [E.button(h, {}, [], ['Cancel']), E.button(h, { variant: 'primary' }, [], ['Deploy'])],
          ),
        ],
        'E.card(h, { title }, children, footer)',
      ),
    ],
  },
  {
    id: 'kbd',
    title: 'Kbd',
    description: 'A keyboard key.',
    render: ({ h }) => [
      sectionOf(h, 'Keys', [E.kbd(h, '⌘'), E.kbd(h, 'K'), E.kbd(h, 'Esc')], "E.kbd(h, 'Esc')"),
    ],
  },
  {
    id: 'spinner',
    title: 'Spinner',
    description: 'Shows work in progress.',
    render: ({ h }) => [
      sectionOf(
        h,
        'Sizes',
        (['sm', 'base', 'lg'] as const).map((s) => E.spinner(h, s)),
        "E.spinner(h, 'lg')",
      ),
    ],
  },
  {
    id: 'avatar',
    title: 'Avatar',
    description: 'A person, as initials.',
    render: ({ h, model, ui }) => {
      const initials = (name: string) =>
        name
          .split(/\s+/)
          .map((word) => word.charAt(0))
          .join('')
          .toUpperCase()
      const one = (state: typeof model.ui.avatarAda, name: string, size: string) => {
        const av = Avatar.parts(state, h, ui)
        return av.root(
          {},
          [h.AriaLabel(name), h.Attribute('data-size', size)],
          [av.fallback({}, [], [initials(name)])],
        )
      }
      return [
        sectionOf(
          h,
          'Sizes',
          [
            one(model.ui.avatarAda, 'Ada Lovelace', 'sm'),
            one(model.ui.avatarGrace, 'Grace Hopper', 'base'),
            one(model.ui.avatarAlan, 'Alan Turing', 'lg'),
          ],
          'const av = Avatar.parts(state, h, ui)\nav.root({}, [], [av.image({}, [], []), av.fallback({}, [], [initials])])',
        ),
      ]
    },
  },
  {
    id: 'item',
    title: 'Item',
    description: 'A row with a title, description and slots.',
    render: ({ h, model, ui }) => [
      sectionOf(
        h,
        'Basic',
        [
          E.item(
            h,
            { title: 'api-gateway', description: 'Updated 2h ago' },
            (() => {
              const av = Avatar.parts(model.ui.avatarItem, h, ui)
              return av.root(
                {},
                [h.AriaLabel('api-gateway'), h.Attribute('data-size', 'base')],
                [av.fallback({}, [], ['AG'])],
              )
            })(),
            E.badge(h, 'success', ['Live']),
          ),
        ],
        'E.item(h, { title }, leading, trailing)',
        stacked,
      ),
    ],
  },
  {
    id: 'bubble',
    title: 'Bubble',
    description: 'A chat message.',
    render: ({ h }) => [
      sectionOf(
        h,
        'Conversation',
        [
          E.bubble(h, { from: 'them' }, ['Did the deploy finish?']),
          E.bubble(h, { from: 'me' }, ['Yes, it is live.']),
        ],
        "E.bubble(h, { from: 'me' }, ['Yes'])",
        stacked,
      ),
    ],
  },
  {
    id: 'marker',
    title: 'Marker',
    description: 'A labelled divider, such as a date in a thread.',
    render: ({ h }) => [
      sectionOf(h, 'Basic', [E.marker(h, 'Today')], "E.marker(h, 'Today')", stacked),
    ],
  },
  {
    id: 'attachment',
    title: 'Attachment',
    description: 'A file chip.',
    render: ({ h }) => [
      sectionOf(
        h,
        'Basic',
        [
          E.attachment(
            h,
            { name: 'report.pdf', size: '2.4 MB' },
            E.button(
              h,
              { shape: 'square', size: 'sm', variant: 'ghost' },
              [h.AriaLabel('Remove')],
              ['×'],
            ),
          ),
        ],
        'E.attachment(h, { name, size }, removeButton)',
        stacked,
      ),
    ],
  },
  {
    id: 'fieldset',
    title: 'Fieldset',
    description: 'Groups related controls under a legend.',
    render: ({ h }) => [
      sectionOf(
        h,
        'Basic',
        [
          E.fieldset(h, 'Contact', [
            E.input(h, { placeholder: 'Name' }, [h.Value('')]),
            E.input(h, { placeholder: 'Email' }, [h.Value('')]),
          ]),
        ],
        "E.fieldset(h, 'Contact', controls)",
        stacked,
      ),
    ],
  },
  {
    id: 'textarea',
    title: 'Textarea',
    description: 'A multi-line field.',
    render: ({ h }) => [
      sectionOf(
        h,
        'Basic',
        [E.textarea(h, { placeholder: 'Message', rows: 3 }, [h.Value('')])],
        'E.textarea(h, { rows: 3 }, [])',
        stacked,
      ),
    ],
  },
  {
    id: 'native-select',
    title: 'Native Select',
    description: 'The browser select.',
    render: ({ h }) => [
      sectionOf(
        h,
        'Basic',
        [
          E.nativeSelect(
            h,
            [
              { value: 'a', label: 'Alpha' },
              { value: 'b', label: 'Beta' },
            ],
            [],
          ),
        ],
        'E.nativeSelect(h, options, [])',
      ),
    ],
  },
  {
    id: 'nav',
    title: 'Nav',
    description: 'A row of links.',
    render: ({ h }) => [
      sectionOf(
        h,
        'Basic',
        [
          E.nav(h, [
            { label: 'Home', href: '#/nav', current: true },
            { label: 'Docs', href: '#/nav' },
            { label: 'Blog', href: '#/nav' },
          ]),
        ],
        'E.nav(h, [{ label, href, current }])',
      ),
    ],
  },
  {
    id: 'progress',
    title: 'Progress',
    description: 'How far a task has got.',
    render: ({ h, model, ui }) => {
      const p = Progress.parts(model.ui.progressUpload, h, ui)
      return [
        sectionOf(
          h,
          'Basic',
          [p.root({}, [h.AriaLabel('Upload')], [p.track({}, [], [p.indicator({}, [], [])])])],
          'const p = Progress.parts(state, h, ui)\np.root({}, [], [p.track({}, [], [p.indicator({}, [], [])])])',
          stacked,
        ),
      ]
    },
  },
  {
    id: 'separator',
    title: 'Separator',
    description: 'A divider.',
    render: ({ h, model, ui }) => {
      const sep = Separator.parts(model.ui.separator, h, ui)
      return [
        sectionOf(
          h,
          'Horizontal',
          [E.text(h, 'body', ['Above']), sep.root({}, [], []), E.text(h, 'body', ['Below'])],
          'Separator.parts(state, h, ui).root({}, [], [])',
          stacked,
        ),
      ]
    },
  },
  {
    id: 'scroll-area',
    title: 'Scroll Area',
    description: 'A region that scrolls.',
    render: ({ h }) => [
      sectionOf(
        h,
        'Basic',
        [
          E.scrollArea(
            h,
            '8rem',
            Array.from({ length: 12 }, (_, i) => h.p([], [`Line ${i + 1}`])),
          ),
        ],
        "E.scrollArea(h, '8rem', lines)",
        stacked,
      ),
    ],
  },
  {
    id: 'direction',
    title: 'Direction',
    description: 'Sets reading direction for a subtree.',
    render: ({ h }) => [
      sectionOf(
        h,
        'RTL',
        [E.direction(h, 'rtl', [E.text(h, 'body', ['مرحبا بالعالم'])])],
        "E.direction(h, 'rtl', children)",
      ),
    ],
  },
]
