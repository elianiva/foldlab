// Pages for the second batch of adapter components.
import {
  AlertDialog,
  Carousel,
  ContextMenu,
  Menu,
  Menubar,
  Toast,
  Drawer,
  FileInput,
  HoverCard,
  Listbox,
  NavigationMenu,
  OtpInput,
  Resizable,
  ScrollArea,
  Toggle,
} from '@foldlab/ui'
import { css } from '../../styled-system/css'
import { Message } from '../app/main.ts'
import { sectionOf, stacked } from './layout.ts'
import type { Page } from './types.ts'

const rowCls = css({ display: 'flex', gap: '0.6rem' })
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
  {
    id: 'context-menu',
    title: 'Context Menu',
    description: 'A menu opened by right click or Shift+F10.',
    render: ({ h, model, ui }) => {
      const m = ContextMenu.parts(model.ui.contextMenu, h, ui)
      return [
        sectionOf(
          h,
          'Basic',
          [
            m['context-trigger']({}, [], ['Right click here']),
            m.content(
              {},
              [],
              ['Back', 'Reload', 'Inspect'].map((text) => m.item({ value: text }, [], [text])),
            ),
            h.p([], [`Last action: ${model.ui.contextMenu.action || 'none'}`]),
          ],
          "m['context-trigger']({}, [], ['Right click here']),\nm.content({}, [], items)",
          stacked,
        ),
      ]
    },
  },
  {
    id: 'menubar',
    title: 'Menubar',
    description: 'A bar of menus. The bar and each menu are separate instances.',
    render: ({ h, model, ui }) => {
      const bar = Menubar.parts(model.ui.menubar, h, ui)
      const menu = (state: Menu.State) => {
        const m = Menu.parts(state, h, ui)
        return [
          m.trigger({}, [], [state.key === 'mb-file' ? 'File' : 'Edit']),
          m.content(
            {},
            [],
            ['New', 'Open', 'Save'].map((text) => m.item({ value: text }, [], [text])),
          ),
        ]
      }
      return [
        sectionOf(
          h,
          'Basic',
          [bar.root({}, [], [...menu(model.ui.mbFile), ...menu(model.ui.mbEdit)])],
          'bar.root({}, [], [...fileMenu, ...editMenu])',
          stacked,
        ),
      ]
    },
  },
  {
    id: 'toggle-group',
    title: 'Toggle Group',
    description: 'Related toggles side by side.',
    render: ({ h, model, ui }) => {
      const states = [
        ['Bold', model.ui.tgBold],
        ['Italic', model.ui.tgItalic],
        ['Underline', model.ui.tgUnderline],
      ] as const
      return [
        sectionOf(
          h,
          'Multiple',
          [
            h.div(
              [h.Attribute('data-slot', 'toggle-group'), h.Role('group')],
              states.map(([text, state]) => Toggle.parts(state, h, ui).root({}, [], [text])),
            ),
          ],
          'h.div([...], [bold, italic, underline].map(s => Toggle.parts(s, h, ui).root({}, [], [label])))',
        ),
      ]
    },
  },
  {
    id: 'toast',
    title: 'Toast',
    description: 'Short messages that leave on their own. Hover or focus pauses the timer.',
    render: ({ h, model, ui }) => {
      const t = Toast.parts(model.ui.toast, h, ui)
      return [
        sectionOf(
          h,
          'Types',
          [
            h.div(
              [h.Class(rowCls)],
              [
                h.button(
                  [h.Type('button'), h.OnClick(Message.ClickedToast({ type: 'success' }))],
                  ['Show success'],
                ),
                h.button(
                  [h.Type('button'), h.OnClick(Message.ClickedToast({ type: 'error' }))],
                  ['Show error'],
                ),
              ],
            ),
            t.region(
              {},
              [],
              [
                t.list(
                  {},
                  [],
                  model.ui.toast.items.map((item) =>
                    t.root(
                      { id: item.id },
                      [],
                      [
                        t.title({ id: item.id }, [], [item.title]),
                        t.description({ id: item.id }, [], [item.description]),
                        t.close({ id: item.id }, [], ['×']),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ],
          't.region({}, [], [t.list({}, [], items.map(item => t.root({ id: item.id }, [], [...])))])',
        ),
      ]
    },
  },
  {
    id: 'file-drop',
    title: 'File Drop',
    description:
      'Drop files on the zone or press the button. Files stay in the instance; the Model keeps names and sizes.',
    render: ({ h, model, ui }) => {
      const f = FileInput.parts(model.ui.files, h, ui)
      return [
        sectionOf(
          h,
          'Dropzone',
          [
            f.root(
              {},
              [],
              [
                f.input({}, [], []),
                f.dropzone({}, [], ['Drop files here, or ', f.trigger({}, [], ['browse'])]),
              ],
            ),
            h.ul(
              [],
              model.ui.files.files.map((file) => h.li([], [`${file.name} (${file.size} bytes)`])),
            ),
          ],
          'f.root({}, [], [f.input({}, [], []), f.dropzone({}, [], [f.trigger({}, [], ["browse"])])])',
          stacked,
        ),
      ]
    },
  },
]
