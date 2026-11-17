// Pages for the second batch of adapter components.
import {
  AlertDialog,
  Carousel,
  Drawer,
  HoverCard,
  Listbox,
  NavigationMenu,
  OtpInput,
  Resizable,
  ScrollArea,
  Toggle,
} from '@foldlab/ui'
import { sectionOf, stacked } from './layout.ts'
import type { Page } from './types.ts'

const lines = Array.from({ length: 30 }, (_, i) => `Row ${i + 1}`)

export const kitPages: ReadonlyArray<Page> = [
  {
    id: 'alert-dialog',
    title: 'Alert Dialog',
    description: 'A modal that needs an explicit answer. Outside presses do not close it.',
    render: ({ h, model, ui }) => {
      const d = AlertDialog.parts(model.ui.alert, h, ui)
      return [
        sectionOf(
          h,
          'Basic',
          [
            d.trigger({}, [], ['Delete project']),
            d.backdrop({}, [], []),
            d.content(
              {},
              [],
              [
                d.title({}, [], ['Delete this project?']),
                d.description({}, [], ['This cannot be undone.']),
                d.close({}, [], ['Cancel']),
              ],
            ),
          ],
          "d.trigger({}, [], ['Delete']),\nd.content({}, [], [d.title(...), d.close(...)])",
        ),
      ]
    },
  },
  {
    id: 'drawer',
    title: 'Drawer',
    description: 'A panel that slides in from the edge. Also covers Sheet.',
    render: ({ h, model, ui }) => {
      const d = Drawer.parts(model.ui.drawer, h, ui)
      return [
        sectionOf(
          h,
          'Right side',
          [
            d.trigger({}, [], ['Open drawer']),
            d.backdrop({}, [], []),
            d.viewport(
              {},
              [],
              [
                d.content(
                  {},
                  [],
                  [
                    d.title({}, [], ['Filters']),
                    d.description({}, [], ['Narrow the list.']),
                    d.close({}, [], ['Done']),
                  ],
                ),
              ],
            ),
          ],
          'd.trigger(...),\nd.viewport({}, [], [d.content({}, [], [...])])',
        ),
      ]
    },
  },
  {
    id: 'hover-card',
    title: 'Hover Card',
    description: 'A preview card shown after hovering a link.',
    render: ({ h, model, ui }) => {
      const c = HoverCard.parts(model.ui.hover, h, ui)
      return [
        sectionOf(
          h,
          'Basic',
          [
            c.trigger({}, [], ['@foldkit']),
            c.content({}, [], [h.strong([], ['Foldkit']), h.p([], ['Elm-style apps in Effect.'])]),
          ],
          "c.trigger({}, [], ['@foldkit']),\nc.content({}, [], [...])",
        ),
      ]
    },
  },
  {
    id: 'toggle',
    title: 'Toggle',
    description: 'A two-state button.',
    render: ({ h, model, ui }) => {
      const t = Toggle.parts(model.ui.toggle, h, ui)
      return [
        sectionOf(
          h,
          'Basic',
          [t.root({}, [], [model.ui.toggle.pressed ? 'Bold: on' : 'Bold: off'])],
          "t.root({}, [], ['Bold'])",
        ),
      ]
    },
  },
  {
    id: 'listbox',
    title: 'Listbox',
    description: 'An always-visible list. Arrow keys move, Enter chooses.',
    render: ({ h, model, ui }) => {
      const l = Listbox.parts(model.ui.listbox, h, ui)
      const items = [
        ['a', 'Alpha'],
        ['b', 'Beta'],
        ['c', 'Gamma'],
      ] as const
      return [
        sectionOf(
          h,
          'Single',
          [
            l.root(
              {},
              [],
              items.map(([value, text]) => l.item({ value, label: text }, [], [text])),
            ),
            h.p([], [`Selected: ${model.ui.listbox.value.join(', ') || 'none'}`]),
          ],
          'l.root({}, [], items.map(([v, t]) => l.item({ value: v, label: t }, [], [t])))',
          stacked,
        ),
      ]
    },
  },
  {
    id: 'navigation-menu',
    title: 'Navigation Menu',
    description: 'Site navigation with flyout panels.',
    render: ({ h, model, ui }) => {
      const n = NavigationMenu.parts(model.ui.navMenu, h, ui)
      return [
        sectionOf(
          h,
          'Basic',
          [
            n.root(
              {},
              [],
              [
                n.list(
                  {},
                  [],
                  [
                    n.item(
                      { value: 'products' },
                      [],
                      [
                        n.trigger({ value: 'products' }, [], ['Products']),
                        n.content({ value: 'products' }, [], [h.p([], ['Workers, D1, R2'])]),
                      ],
                    ),
                    n.item({ value: 'docs' }, [], [n.link({ value: 'docs' }, [], ['Docs'])]),
                  ],
                ),
              ],
            ),
          ],
          'n.root({}, [], [n.list({}, [], [n.item({ value }, [], [n.trigger(...), n.content(...)])])])',
        ),
      ]
    },
  },
  {
    id: 'input-otp',
    title: 'Input OTP',
    description: 'A one-time code split into slots.',
    render: ({ h, model, ui }) => {
      const o = OtpInput.parts(model.ui.otp, h, ui)
      return [
        sectionOf(
          h,
          'Six digits',
          [
            o.root(
              {},
              [],
              [
                o.control({}, [], []),
                o.group(
                  {},
                  [],
                  [0, 1, 2, 3, 4, 5].map((index) =>
                    o.slot({ index }, [], [model.ui.otp.value[index] ?? '']),
                  ),
                ),
              ],
            ),
            h.p([], [`Value: ${model.ui.otp.value || 'empty'}`]),
          ],
          'o.root({}, [], [o.control({}, [], []), o.group({}, [], slots.map(index => o.slot({ index }, [], [char])))])',
          stacked,
        ),
      ]
    },
  },
  {
    id: 'carousel',
    title: 'Carousel',
    description: 'Slides with previous, next and page indicators.',
    render: ({ h, model, ui }) => {
      const c = Carousel.parts(model.ui.carousel, h, ui)
      const ids = ['one', 'two', 'three']
      return [
        sectionOf(
          h,
          'Basic',
          [
            c.root(
              {},
              [],
              [
                c.viewport(
                  {},
                  [],
                  [
                    c.content(
                      {},
                      [],
                      ids.map((id) => c.item({ id }, [], [`Slide ${id}`])),
                    ),
                  ],
                ),
                c.previous({}, [], ['Prev']),
                c.next({}, [], ['Next']),
                c['indicator-group'](
                  {},
                  [],
                  ids.map((id, i) => c.indicator({ page: i + 1, id }, [], [])),
                ),
              ],
            ),
          ],
          'c.root({}, [], [c.viewport({}, [], [c.content({}, [], items)]), c.previous(...), c.next(...)])',
          stacked,
        ),
      ]
    },
  },
  {
    id: 'resizable',
    title: 'Resizable',
    description: 'Panels split by a draggable handle.',
    render: ({ h, model, ui }) => {
      const r = Resizable.parts(model.ui.resizable, h, ui)
      return [
        sectionOf(
          h,
          'Horizontal',
          [
            r.root(
              {},
              [],
              [
                r.panel({ id: 'left', defaultSize: 50 }, [], ['Left']),
                r.handle({ id: 'handle' }, [], []),
                r.panel({ id: 'right', defaultSize: 50 }, [], ['Right']),
              ],
            ),
          ],
          'r.root({}, [], [r.panel({ id }, [], [...]), r.handle({ id }, [], []), r.panel(...)])',
          stacked,
        ),
      ]
    },
  },
  {
    id: 'scroll-area-live',
    title: 'Scroll Area (ui-sdk)',
    description: 'A scroll container with custom scrollbars.',
    render: ({ h, model, ui }) => {
      const s = ScrollArea.parts(model.ui.scroll, h, ui)
      return [
        sectionOf(
          h,
          'Vertical',
          [
            s.root(
              {},
              [],
              [
                s.viewport(
                  {},
                  [],
                  [
                    s.content(
                      {},
                      [],
                      lines.map((line) => h.p([], [line])),
                    ),
                  ],
                ),
                s.scrollbar({}, [], [s.thumb({}, [], [])]),
              ],
            ),
          ],
          's.root({}, [], [s.viewport({}, [], [s.content(...)]), s.scrollbar({}, [], [s.thumb({}, [], [])])])',
          stacked,
        ),
      ]
    },
  },
]
