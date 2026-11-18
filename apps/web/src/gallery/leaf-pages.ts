import {
  ColorPicker,
  DatePicker,
  ImageCropper,
  Timeline,
  Tree,
  TriggerMenu,
  Waterfall,
} from '@foldlab/adapter'
import type { Html } from 'foldkit/html'
import { sectionOf, stacked } from './layout.ts'
import type { Ctx, Page } from './types.ts'

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
const weekdayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export const photo = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420"><rect width="640" height="420" fill="#e5e5e5"/><circle cx="460" cy="150" r="56" fill="#fafafa"/><path d="M0 280 120 170l110 100 120-130 130 125 90-60 70 40v175H0z" fill="#a3a3a3"/><path d="M0 330l160-80 120 70 150-80 210 85v95H0z" fill="#525252"/></svg>',
)}`

export const treeFiles: ReadonlyArray<Tree.Node> = [
  { value: 'app', label: 'app', parent: '' },
  { value: 'app/layout.tsx', label: 'layout.tsx', parent: 'app' },
  { value: 'app/page.tsx', label: 'page.tsx', parent: 'app' },
  { value: 'components', label: 'components', parent: '' },
  { value: 'components/button.tsx', label: 'button.tsx', parent: 'components' },
  { value: 'package.json', label: 'package.json', parent: '' },
]

export const treeStack: ReadonlyArray<Tree.Node> = [
  { value: 'frontend', label: 'Frontend', parent: '' },
  { value: 'react', label: 'React', parent: 'frontend' },
  { value: 'vue', label: 'Vue', parent: 'frontend' },
  { value: 'backend', label: 'Backend', parent: '' },
  { value: 'node', label: 'Node', parent: 'backend' },
  { value: 'postgres', label: 'Postgres', parent: 'backend' },
]

export const waterfallRows: ReadonlyArray<Waterfall.Row> = [
  { value: 'document', label: '/', start: 0, duration: 182, parent: '' },
  { value: 'styles', label: 'app.css', start: 190, duration: 96, parent: '' },
  { value: 'script', label: 'app.js', start: 192, duration: 410, parent: '' },
  { value: 'chunk', label: 'chunk.js', start: 300, duration: 200, parent: 'script' },
  { value: 'user', label: 'api/user', start: 610, duration: 240, parent: '' },
]

export const people: ReadonlyArray<TriggerMenu.Item> = [
  { value: 'hollis', label: 'Hollis Grant' },
  { value: 'ines', label: 'Ines Moreau' },
  { value: 'kofi', label: 'Kofi Mensah' },
  { value: 'wren', label: 'Wren Takahashi' },
]

const datePickerPage = ({ h, model, ui }: Ctx): ReadonlyArray<Html> => {
  const state = model.ui.datePicker
  const d = DatePicker.parts(state, h, ui)
  const [year, month] = state.month.split('-').map(Number) as [number, number]
  const presets = [
    ['Today', '2026-11-17'],
    ['Tomorrow', '2026-11-18'],
  ] as const
  return [
    sectionOf(
      h,
      'Input, calendar and presets',
      [
        d.root(
          {},
          [],
          [
            h.div(
              [h.Attribute('data-slot', 'date-picker-row')],
              [
                d.input({}, [h.AriaLabel('Due date'), h.Placeholder('YYYY-MM-DD')], []),
                d.clear({}, [h.AriaLabel('Clear date')], ['\u00d7']),
                d.trigger({}, [], ['\u25a6']),
              ],
            ),
            d.hint({}, [], ['Type 2026-11-30 or 11/30/2026']),
            d.content(
              {},
              [],
              [
                d.viewport(
                  {},
                  [],
                  [
                    h.div(
                      [h.Attribute('data-slot', 'date-picker-header')],
                      [
                        d.previous({}, [], ['\u2039']),
                        d.heading({}, [], [`${monthNames[month - 1]} ${year}`]),
                        d.next({}, [], ['\u203a']),
                      ],
                    ),
                    d.grid(
                      {},
                      [],
                      [
                        d.weekdays(
                          {},
                          [],
                          weekdayNames.map((name, index) => d.weekday({ index }, [], [name])),
                        ),
                        ...DatePicker.weeksOf(state.month).map((week, index) =>
                          d.week(
                            { index },
                            [],
                            week.map((date) =>
                              d.day({ value: date }, [], [String(Number(date.slice(8)))]),
                            ),
                          ),
                        ),
                      ],
                    ),
                    h.div(
                      [h.Attribute('data-slot', 'date-picker-presets')],
                      presets.map(([label, value]) => d.preset({ value }, [], [label])),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
        h.p([], [`Selected: ${state.value || 'none'}`]),
      ],
      'd.root({}, [], [d.input(...), d.clear(...), d.trigger(...), d.hint(...), d.content({}, [], [d.viewport(...)])])',
      stacked,
    ),
  ]
}

const swatchColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#0ea5e9', '#6366f1', '#a855f7']

const colorPickerPage = ({ h, model, ui }: Ctx): ReadonlyArray<Html> => {
  const state = model.ui.colorPicker
  const c = ColorPicker.parts(state, h, ui)
  return [
    sectionOf(
      h,
      'Area, hue slider and swatches',
      [
        c.root(
          {},
          [h.AriaLabel('Brand color')],
          [
            c.area({}, [], [c['area-thumb']({}, [], [])]),
            h.div(
              [h.Attribute('data-slot', 'color-picker-row')],
              [
                c.slider(
                  { id: 'hue', channel: 'hue' },
                  [],
                  [c['slider-thumb']({ id: 'hue', channel: 'hue' }, [], [])],
                ),
                c.swatch({}, [], []),
              ],
            ),
            c.input({}, [h.AriaLabel('Hex color')], []),
            c.swatches(
              {},
              [h.AriaLabel('Presets')],
              swatchColors.map((value) => c['swatch-item']({ value }, [], [])),
            ),
          ],
        ),
        h.p([], [`Value: ${state.value}`]),
      ],
      'c.root({}, [], [c.area({}, [], [c["area-thumb"]({}, [], [])]), c.slider({ channel: "hue" }, [], [...]), c.input(...), c.swatches(...)])',
      stacked,
    ),
  ]
}

const cropperPage = ({ h, model, ui }: Ctx): ReadonlyArray<Html> => {
  const state = model.ui.imageCropper
  const c = ImageCropper.parts(state, h, ui)
  const handles = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']
  return [
    sectionOf(
      h,
      'Box selection',
      [
        c.root(
          {},
          [h.AriaLabel('Photo')],
          [
            c.viewport(
              {},
              [],
              [
                c.image({}, [h.Alt('Mountains')], []),
                c.selection(
                  {},
                  [],
                  [
                    c.grid({}, [], []),
                    ...handles.map((position) => c.handle({ position }, [], [])),
                  ],
                ),
              ],
            ),
            h.div(
              [h.Attribute('data-slot', 'image-cropper-controls')],
              [
                c.zoom({}, [], []),
                c.rotate({}, [], ['Rotate']),
                c.flip({ direction: 'horizontal' }, [], ['Flip horizontal']),
                c.flip({ direction: 'vertical' }, [], ['Flip vertical']),
              ],
            ),
          ],
        ),
        h.p(
          [],
          [
            state.crop === null
              ? 'Crop: loading'
              : `Crop: ${state.crop.width} x ${state.crop.height} at ${state.crop.x}, ${state.crop.y}, rotation ${state.crop.rotation}`,
          ],
        ),
      ],
      'c.root({}, [], [c.viewport({}, [], [c.image({}, [], []), c.selection({}, [], [c.grid(...), c.handle({ position })])]), c.zoom(...), c.rotate(...), c.flip({ direction })])',
      stacked,
    ),
  ]
}

const treeSection = (c: Ctx, state: Tree.State, title: string): Html => {
  const { h, ui } = c
  const t = Tree.parts(state, h, ui)
  const items = (parent: string): ReadonlyArray<Html> =>
    Tree.childrenOf(state, parent).map((node) => {
      const branch = Tree.isBranch(state, node.value)
      const props = Tree.itemProps(state, node)
      return t.item(
        props,
        [],
        [
          t.label(
            { value: node.value },
            [],
            [
              ...(branch ? [t.indicator({ value: node.value }, [], ['\u203a'])] : []),
              ...(state.checkable ? [t.checkbox({ value: node.value }, [], [])] : []),
              node.label,
            ],
          ),
          ...(branch ? [t.group({ value: node.value }, [], items(node.value))] : []),
        ],
      )
    })
  return sectionOf(
    h,
    title,
    [
      t.root({}, [h.AriaLabel(title)], items('')),
      h.p(
        [],
        [
          state.checkable
            ? `Checked: ${state.checked.join(', ') || 'none'}`
            : `Selected: ${state.value ?? 'none'}`,
        ],
      ),
    ],
    't.root({}, [], [t.item(itemProps, [], [t.label({ value }, [], [t.indicator(...), t.checkbox(...), label]), t.group({ value }, [], children)])])',
    stacked,
  )
}

const treePage = (c: Ctx): ReadonlyArray<Html> => [
  treeSection(c, c.model.ui.tree, 'Files'),
  treeSection(c, c.model.ui.treeChecks, 'Checkboxes'),
]

const events = [
  ['Deployed to production', 'Today, 2:32 PM', 'Version 2.4.1 is live in every region.', 'current'],
  ['Checks passed', 'Today, 2:20 PM', '312 tests and the bundle size budget.', 'complete'],
  ['Pull request merged', 'Today, 1:58 PM', 'Ada merged the cache change into main.', 'complete'],
  ['Review requested', 'Yesterday, 5:05 PM', 'Grace and Linus were asked to review.', 'complete'],
] as const

const timelineSection = (c: Ctx, state: Timeline.State, title: string): Html => {
  const { h, ui } = c
  const t = Timeline.parts(state, h, ui)
  return sectionOf(
    h,
    title,
    [
      t.root(
        {},
        [h.AriaLabel('Activity')],
        events.map(([name, time, text, status]) => {
          const props = { value: name, status }
          return t.item(
            props,
            [],
            [
              t.marker(props, [], []),
              t.connector(props, [], []),
              t.title(props, [], [name]),
              t.time(props, [], [time]),
              t.description(props, [], [text]),
            ],
          )
        }),
      ),
    ],
    't.item({ value, status }, [], [t.marker(props), t.connector(props), t.title(props), t.time(props), t.description(props)])',
    stacked,
  )
}

const timelinePage = (c: Ctx): ReadonlyArray<Html> => [
  timelineSection(c, c.model.ui.timeline, 'Vertical'),
  timelineSection(c, c.model.ui.timelineRow, 'Horizontal'),
]

const waterfallPage = ({ h, model, ui }: Ctx): ReadonlyArray<Html> => {
  const state = model.ui.waterfall
  const w = Waterfall.parts(state, h, ui)
  return [
    sectionOf(
      h,
      'Network requests',
      [
        w.root(
          {},
          [h.AriaLabel('Network requests')],
          [
            w['header-row'](
              {},
              [],
              [
                w['column-header']({}, [], ['Name']),
                w['column-header'](
                  {},
                  [h.AriaLabel('Timeline')],
                  [
                    w.axis(
                      { maxTicks: 5 },
                      [],
                      Waterfall.ticksOf(state).map((time) => w.tick({ time }, [], [`${time} ms`])),
                    ),
                    w.mark({ time: 620 }, [], ['DOMContentLoaded']),
                  ],
                ),
              ],
            ),
            ...Waterfall.orderedRows(state).map((row) =>
              w.row(
                { value: row.value },
                [],
                [
                  w['row-header'](
                    { value: row.value },
                    [],
                    [
                      ...(Waterfall.isBranch(state, row.value)
                        ? [w.indicator({ value: row.value }, [], ['\u203a'])]
                        : []),
                      row.label,
                    ],
                  ),
                  w.bar({ value: row.value }, [], []),
                ],
              ),
            ),
          ],
        ),
        h.p([], [`Selected: ${state.value ?? 'none'}`]),
      ],
      'w.root({}, [], [w["header-row"](...), ...rows.map(row => w.row({ value }, [], [w["row-header"](...), w.bar({ value })]))])',
      stacked,
    ),
  ]
}

const triggerMenuPage = ({ h, model, ui }: Ctx): ReadonlyArray<Html> => {
  const state = model.ui.triggerMenu
  const m = TriggerMenu.parts(state, h, ui)
  const visible = TriggerMenu.visibleItems(state)
  return [
    sectionOf(
      h,
      'Mention people',
      [
        m.input({}, [h.AriaLabel('Message'), h.Placeholder('Type @ to mention someone')], []),
        m.hint({}, [], ['Type @ then a name']),
        m.content(
          {},
          [],
          [
            m.status({}, [], [`${visible.length} results`]),
            m.list(
              {},
              [],
              visible.map((item) =>
                m.item({ value: item.value, label: item.label }, [], [item.label]),
              ),
            ),
            ...(visible.length === 0 ? [m.empty({}, [], ['No one found'])] : []),
          ],
        ),
        h.p([], [`Query: ${state.query || 'none'}`]),
      ],
      'm.input(...), m.content({}, [], [m.status(...), m.list({}, [], items.map(i => m.item({ value, label }, [], [label]))), m.empty(...)])',
      stacked,
    ),
  ]
}

export const leafPages: ReadonlyArray<Page> = [
  {
    id: 'date-picker',
    title: 'Date Picker',
    description: 'A date input with a calendar popup and presets.',
    render: datePickerPage,
  },
  {
    id: 'color-picker',
    title: 'Color Picker',
    description: 'Pick a color from an area, a slider, an input or a swatch.',
    render: colorPickerPage,
  },
  {
    id: 'image-cropper',
    title: 'Image Cropper',
    description: 'Crop, zoom, rotate and flip an image.',
    render: cropperPage,
  },
  {
    id: 'tree',
    title: 'Tree',
    description: 'Nested items that expand, select and check.',
    render: treePage,
  },
  {
    id: 'timeline',
    title: 'Timeline',
    description: 'Events in order, with markers and connectors.',
    render: timelinePage,
  },
  {
    id: 'waterfall',
    title: 'Waterfall',
    description: 'Rows of spans on a shared time axis.',
    render: waterfallPage,
  },
  {
    id: 'trigger-menu',
    title: 'Trigger Menu',
    description: 'A menu that opens when a trigger character is typed.',
    render: triggerMenuPage,
  },
]
