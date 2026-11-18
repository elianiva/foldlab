import {
  Combobox,
  flattenEntries,
  listItems,
  Listbox,
  Popover,
  Select,
  Tabs,
} from '@foldlab/adapter'
import type { Entry } from '@foldlab/adapter'
import { sectionOf, stacked } from './layout.ts'
import type { Page } from './types.ts'

export const groupedEntries: ReadonlyArray<Entry> = [
  {
    type: 'group',
    label: 'Americas',
    items: [
      { value: 'us-east', label: 'US East' },
      { value: 'sa-east', label: 'South America' },
    ],
  },
  { type: 'separator' },
  {
    type: 'group',
    label: 'Europe',
    items: [
      { value: 'eu-west', label: 'EU West' },
      { value: 'eu-north', label: 'EU North', disabled: true },
    ],
  },
]

export const listPages: ReadonlyArray<Page> = [
  {
    id: 'list-items',
    title: 'List Items',
    description: 'Options rendered from data: groups, separators and disabled rows.',
    render: ({ h, model, ui }) => {
      const state = model.ui.groupedSelect
      const s = Select.parts(state, h, ui)
      const l = Listbox.parts(model.ui.groupedListbox, h, ui)
      const c = Combobox.parts(model.ui.groupedCombo, h, ui)
      return [
        sectionOf(
          h,
          'Select',
          [
            s.root(
              {},
              [],
              [
                s.label({}, [], ['Region']),
                s.trigger(
                  {},
                  [],
                  [
                    s.value(
                      {},
                      [],
                      [state.value === '' ? 'Choose' : Select.labelOf(state, state.value)],
                    ),
                    s.arrow({}, [], []),
                  ],
                ),
                s.content({}, [], [s.list({}, [], listItems(s, groupedEntries))]),
              ],
            ),
          ],
          's.content({}, [], [s.viewport({}, [], [s.list({}, [], listItems(s, entries))])])',
          stacked,
        ),
        sectionOf(
          h,
          'Listbox',
          [l.root({}, [], listItems(l, groupedEntries))],
          'l.root({}, [], listItems(l, entries))',
          stacked,
        ),
        sectionOf(
          h,
          'Combobox',
          [
            c.root(
              {},
              [],
              [
                c.input({}, [h.Placeholder('Search regions')], []),
                c.content(
                  {},
                  [],
                  [c.header({}, [], ['Regions']), c.list({}, [], listItems(c, groupedEntries))],
                ),
              ],
            ),
          ],
          'c.content({}, [], [c.header(...), c.viewport({}, [], [c.list({}, [], listItems(c, entries))])])',
          stacked,
        ),
      ]
    },
  },
  {
    id: 'popup-parts',
    title: 'Popup Parts',
    description: 'Arrow, viewport and shortcut slots, and the tabs indicator.',
    render: ({ h, model, ui }) => {
      const p = Popover.parts(model.ui.popArrow, h, ui)
      const t = Tabs.parts(model.ui.tabs, h, ui)
      return [
        sectionOf(
          h,
          'Popover with arrow',
          [
            p.trigger({}, [], ['Open']),
            p.content(
              {},
              [],
              [p.arrow({}, [], []), p.title({}, [], ['Arrow']), p.shortcut({}, [], ['Esc'])],
            ),
          ],
          'p.content({}, [], [p.arrow({}, [], []), p.viewport({}, [], [...])])',
          stacked,
        ),
        sectionOf(
          h,
          'Tabs indicator',
          [
            t.root(
              {},
              [],
              [
                t.list(
                  {},
                  [],
                  [
                    t.tab({ value: 'overview' }, [], ['Overview']),
                    t.tab({ value: 'logs' }, [], ['Logs']),
                    t.indicator({}, [], []),
                  ],
                ),
              ],
            ),
          ],
          't.list({}, [], [...tabs, t.indicator({}, [], [])])',
          stacked,
        ),
      ]
    },
  },
]

export const groupedItems = flattenEntries(groupedEntries)
