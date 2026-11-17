// Popup components. Their content leaves the page flow (core positions it), so each
// one carries a lifecycle bit in the Model: see "Lifecycle state" in docs/adapter-api.md.
import { Menu, Popover, Select, Tooltip } from '@foldlab/ui'
import { sectionOf, stacked } from './layout.ts'
import type { Page } from './types.ts'

export const popupPages: ReadonlyArray<Page> = [
  {
    id: 'tooltip',
    title: 'Tooltip',
    description: 'A short hint shown on hover or focus.',
    render: ({ h, model, ui }) => {
      const t = Tooltip.parts(model.ui.tip, h, ui)
      return [
        sectionOf(
          h,
          'Basic',
          [t.trigger({}, [], ['Hover or focus me']), t.content({}, [], ['Saves your changes'])],
          "t.trigger({}, [], ['Hover or focus me']),\nt.content({}, [], ['Saves your changes'])",
        ),
      ]
    },
  },
  {
    id: 'popover',
    title: 'Popover',
    description: 'Rich content anchored to a trigger. Escape or an outside press closes it.',
    render: ({ h, model, ui }) => {
      const p = Popover.parts(model.ui.pop, h, ui)
      return [
        sectionOf(
          h,
          'With title and close',
          [
            p.trigger({}, [], ['Open popover']),
            p.content(
              {},
              [],
              [
                p.title({}, [], ['Worker settings']),
                p.description({}, [], ['Routes and variables apply to every deployment.']),
                p.close({}, [], ['Done']),
              ],
            ),
          ],
          "p.trigger({}, [], ['Open']),\np.content({}, [], [p.title({}, [], ['Settings']), p.close({}, [], ['Done'])])",
        ),
      ]
    },
  },
  {
    id: 'dropdown',
    title: 'Dropdown',
    description: 'A menu of actions. Arrow keys move, typing jumps, Enter chooses.',
    render: ({ h, model, ui }) => {
      const m = Menu.parts(model.ui.menu, h, ui)
      const items = [
        ['edit', 'Edit'],
        ['duplicate', 'Duplicate'],
        ['delete', 'Delete'],
      ] as const
      return [
        sectionOf(
          h,
          'Basic',
          [
            m.trigger({}, [], ['Actions ▾']),
            m.content(
              {},
              [],
              items.map(([value, text]) => m.item({ value }, [], [text])),
            ),
            h.p([], [`Last action: ${model.ui.menu.action || 'none'}`]),
          ],
          "m.trigger({}, [], ['Actions']),\nm.content({}, [], items.map(([v, text]) => m.item({ value: v }, [], [text])))",
          stacked,
        ),
      ]
    },
  },
  {
    id: 'select',
    title: 'Select',
    description: 'Choose one value from a list.',
    render: ({ h, model, ui }) => {
      const state = model.ui.region
      const s = Select.parts(state, h, ui)
      return [
        sectionOf(
          h,
          'Basic',
          [
            s.root(
              {},
              [],
              [
                s.trigger(
                  {},
                  [],
                  [
                    state.value === '' ? 'Choose a region' : Select.labelOf(state, state.value),
                    ' ▾',
                  ],
                ),
                s.content(
                  {},
                  [],
                  [
                    s.list(
                      {},
                      [],
                      state.items.map((item) =>
                        s.item(
                          { value: item.value, label: item.label },
                          [],
                          [s['item-text']({ text: item.label }, [], [item.label])],
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
            h.p([], [`Selected: ${state.value || 'none'}`]),
          ],
          "s.root({}, [], [s.trigger({}, [], ['Choose a region']),\n  s.content({}, [], [s.list({}, [], items.map(i => s.item({ value: i.value, label: i.label }, [], [...])))])])",
          stacked,
        ),
      ]
    },
  },
]
