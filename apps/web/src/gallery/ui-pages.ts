// Pages for components that run through the adapter: their state is in the Model
// (`model.ui.*`), and the parts come from `Component.parts(state, h, ui)`.
import { Checkbox, Collapsible, Radio, Slider, Switch, Tabs } from '@foldlab/ui'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { css } from '../../styled-system/css'
import type { Message } from '../app/main.ts'
import { sectionOf, stacked } from './layout.ts'
import type { Page } from './types.ts'

const rowCls = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.55rem',
  cursor: 'pointer',
})
const colCls = css({ display: 'flex', flexDirection: 'column', gap: '0.7rem' })

const choice = (h: HtmlBuilder<Message>, control: Html, text: string): Html =>
  h.label([h.Class(rowCls)], [control, h.span([], [text])])

export const uiPages: ReadonlyArray<Page> = [
  {
    id: 'checkbox',
    title: 'Checkbox',
    description: 'A control that is either checked or not.',
    render: ({ h, model, ui }) => {
      const on = Checkbox.parts(model.ui.checkOn, h, ui)
      const off = Checkbox.parts(model.ui.checkOff, h, ui)
      const disabled = Checkbox.parts(model.ui.checkDisabled, h, ui)
      const box = (p: typeof on) => p.root({}, [], [p.indicator({}, [], ['✓'])])
      return [
        sectionOf(
          h,
          'Basic',
          [
            choice(h, box(on), 'Email me about releases'),
            choice(h, box(off), 'Share usage data'),
            choice(h, box(disabled), 'Disabled'),
          ],
          [
            'const c = Checkbox.parts(model.ui.news, h, ui)',
            "h.label([], [c.root({}, [], [c.indicator({}, [], ['✓'])]), h.span([], ['Email me'])])",
          ].join('\n'),
        ),
      ]
    },
  },
  {
    id: 'switch',
    title: 'Switch',
    description: 'A toggle for an on or off setting.',
    render: ({ h, model, ui }) => {
      const a = Switch.parts(model.ui.switchOn, h, ui)
      const b = Switch.parts(model.ui.switchOff, h, ui)
      const c = Switch.parts(model.ui.switchDisabled, h, ui)
      const sw = (p: typeof a) => p.root({}, [], [p.thumb({}, [], [])])
      return [
        sectionOf(
          h,
          'Basic',
          [
            choice(h, sw(a), 'Notifications'),
            choice(h, sw(b), 'Dark mode'),
            choice(h, sw(c), 'Disabled'),
          ],
          "const s = Switch.parts(model.ui.dark, h, ui)\nh.label([], [s.root({}, [], [s.thumb({}, [], [])]), h.span([], ['Dark mode'])])",
        ),
      ]
    },
  },
  {
    id: 'radio',
    title: 'Radio',
    description: 'Pick exactly one option from a short list.',
    render: ({ h, model, ui }) => {
      const r = Radio.parts(model.ui.plan, h, ui)
      const plans = [
        ['free', 'Free'],
        ['pro', 'Pro'],
        ['team', 'Team'],
      ] as const
      return [
        sectionOf(
          h,
          'Basic',
          [
            r.group(
              {},
              [h.Class(colCls)],
              plans.map(([value, text]) =>
                choice(h, r.root({ value }, [], [r.indicator({ value }, [], [])]), text),
              ),
            ),
            h.p([], [`Selected: ${model.ui.plan.value || 'none'}`]),
          ],
          'r.group({}, [], plans.map(([value, text]) =>\n  h.label([], [r.root({ value }, [], [r.indicator({ value }, [], [])]), h.span([], [text])])))',
          stacked,
        ),
      ]
    },
  },
  {
    id: 'tabs',
    title: 'Tabs',
    description: 'Switch between related panels. Arrow keys move between tabs.',
    render: ({ h, model, ui }) => {
      const t = Tabs.parts(model.ui.tabs, h, ui)
      const items = [
        ['overview', 'Overview', 'A summary of the worker.'],
        ['logs', 'Logs', 'Recent log lines appear here.'],
        ['settings', 'Settings', 'Routes, variables and bindings.'],
      ] as const
      return [
        sectionOf(
          h,
          'Basic',
          [
            t.root(
              {},
              [],
              [
                t.list(
                  {},
                  [],
                  items.map(([value, text]) => t.tab({ value }, [], [text])),
                ),
                ...items.map(([value, , body]) => t.panel({ value }, [], [h.p([], [body])])),
              ],
            ),
          ],
          't.root({}, [], [t.list({}, [], tabs.map(([v, text]) => t.tab({ value: v }, [], [text]))),\n  ...tabs.map(([v, , body]) => t.panel({ value: v }, [], [h.p([], [body])]))])',
          stacked,
        ),
      ]
    },
  },
  {
    id: 'collapsible',
    title: 'Collapsible',
    description: 'Shows and hides one section.',
    render: ({ h, model, ui }) => {
      const c = Collapsible.parts(model.ui.collapse, h, ui)
      return [
        sectionOf(
          h,
          'Basic',
          [
            c.root(
              {},
              [],
              [
                c.trigger({}, [], [model.ui.collapse.open ? 'Hide details' : 'Show details']),
                c.panel(
                  {},
                  [],
                  [h.p([], ['Region: us-east. Runtime: workerd. Last deploy: 2 hours ago.'])],
                ),
              ],
            ),
          ],
          "c.root({}, [], [c.trigger({}, [], ['Show details']), c.panel({}, [], [h.p([], ['...'])])])",
          stacked,
        ),
      ]
    },
  },
  {
    id: 'slider',
    title: 'Slider',
    description: 'Pick a number in a range. Arrow keys, Home and End also work.',
    render: ({ h, model, ui }) => {
      const s = Slider.parts(model.ui.slider, h, ui)
      return [
        sectionOf(
          h,
          'Basic',
          [
            s.root(
              {},
              [],
              [
                s.control(
                  {},
                  [],
                  [
                    s.track(
                      {},
                      [],
                      [
                        s.indicator({}, [], []),
                        s.thumb(
                          { index: 0 },
                          [],
                          [s['thumb-input']({ index: 0 }, [h.AriaLabel('Volume')], [])],
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
            h.p([], [`Value: ${model.ui.slider.value[0] ?? 0}`]),
          ],
          "s.control({}, [], [s.track({}, [], [s.indicator({}, [], []),\n  s.thumb({ index: 0 }, [], [s['thumb-input']({ index: 0 }, [], [])])])])",
          stacked,
        ),
      ]
    },
  },
]
