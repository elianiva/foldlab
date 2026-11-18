// Components with no ui-sdk primitive. Foldkit owns them end to end: state in the Model,
// events through `h.On*`, no Mount. Nothing here is bound, so Scene can drive all of it.
import { sectionOf, stacked } from './layout.ts'
import { Sortable } from '@foldlab/adapter'
import { Message } from '../app/main.ts'
import type { Page } from './types.ts'

const ROW = 32
const VIEW = 192
const TOTAL = 10_000

const messages = [
  ['Ada', 'Deploy is green.'],
  ['Grace', 'Rolling out to eu-west next.'],
  ['Alan', 'Watch the error rate for ten minutes.'],
  ['Ada', 'Error rate is flat. Done.'],
] as const

const steps = [
  ['Name', 'What should the project be called?'],
  ['Region', 'Where should it run?'],
  ['Review', 'Check the details, then create it.'],
] as const

export const nativePages: ReadonlyArray<Page> = [
  {
    id: 'resizable-box',
    title: 'Resizable Box',
    description: 'A box the user resizes by dragging its corner. Pure CSS.',
    render: ({ h }) => [
      sectionOf(
        h,
        'Corner handle',
        [h.div([h.Attribute('data-slot', 'resizable-box')], ['Drag the corner'])],
        "h.div([h.Attribute('data-slot', 'resizable-box')], ['Drag the corner'])",
        stacked,
      ),
    ],
  },
  {
    id: 'message-scroller',
    title: 'Message Scroller',
    description: 'A chat log that stays pinned to the newest message.',
    render: ({ h }) => [
      sectionOf(
        h,
        'Chat',
        [
          h.div(
            [h.Attribute('data-slot', 'message-scroller')],
            messages.map(([who, text]) =>
              h.div(
                [h.Attribute('data-slot', 'message-scroller-item')],
                [h.strong([], [who]), h.span([], [text])],
              ),
            ),
          ),
        ],
        'h.div([data-slot message-scroller], messages.map(...))',
        stacked,
      ),
    ],
  },
  {
    id: 'virtual-list',
    title: 'Virtual List',
    description: `${TOTAL.toLocaleString('en')} rows, a dozen in the DOM. The Model holds the scroll offset.`,
    render: ({ h, model }) => {
      const first = Math.max(0, Math.floor(model.demo.scroll / ROW) - 2)
      const last = Math.min(TOTAL, first + Math.ceil(VIEW / ROW) + 4)
      const rows = Array.from({ length: last - first }, (_, i) => first + i)
      return [
        sectionOf(
          h,
          'Windowed',
          [
            h.div(
              [
                h.Attribute('data-slot', 'virtual-list'),
                h.Style({ height: `${VIEW}px` }),
                h.OnScroll((top) => Message.ScrolledList({ top })),
              ],
              [
                h.div(
                  [h.Style({ height: `${TOTAL * ROW}px`, position: 'relative' })],
                  rows.map((row) =>
                    h.div(
                      [
                        h.Key(String(row)),
                        h.Attribute('data-slot', 'virtual-list-row'),
                        h.Style({ top: `${row * ROW}px`, height: `${ROW}px` }),
                      ],
                      [`Row ${row + 1}`],
                    ),
                  ),
                ),
              ],
            ),
            h.p([], [`Rendered rows: ${rows.length}`]),
          ],
          'h.div([OnScroll(top => Message.ScrolledList({ top }))], [spacer(rows.slice(first, last))])',
          stacked,
        ),
      ]
    },
  },
  {
    id: 'drag-and-drop',
    title: 'Drag and Drop',
    description: 'Reorder a list. The order and the dragged item live in the Model.',
    render: ({ h, model, ui }) => {
      const sortable = Sortable.parts(model.ui.sortable, h, ui)
      return [
        sectionOf(
          h,
          'Sortable',
          [
            sortable.root(
              {},
              [h.AriaLabel('Steps')],
              Sortable.orderOf(model.ui.sortable).map((id) =>
                sortable.item({ value: id }, [], [id]),
              ),
            ),
          ],
          'const s = Sortable.parts(state, h, ui)\\ns.root({}, [], Sortable.orderOf(state).map((id) => s.item({ value: id }, [], [id])))',
          stacked,
        ),
      ]
    },
  },
  {
    id: 'questionnaire',
    title: 'Questionnaire',
    description: 'A short stepped form. The step is Model state.',
    render: ({ h, model }) => {
      const step = model.demo.step
      const [title, body] = steps[step] ?? steps[0]
      return [
        sectionOf(
          h,
          'Three steps',
          [
            h.div(
              [h.Attribute('data-slot', 'questionnaire')],
              [
                h.p(
                  [h.Attribute('data-slot', 'questionnaire-progress')],
                  [`Step ${step + 1} of ${steps.length}`],
                ),
                h.h3([], [title]),
                h.p([], [body]),
                h.div(
                  [h.Attribute('data-slot', 'questionnaire-actions')],
                  [
                    h.button(
                      [
                        h.Type('button'),
                        h.Disabled(step === 0),
                        h.OnClick(Message.ChosenStep({ value: step - 1 })),
                      ],
                      ['Back'],
                    ),
                    h.button(
                      [
                        h.Type('button'),
                        h.Disabled(step === steps.length - 1),
                        h.OnClick(Message.ChosenStep({ value: step + 1 })),
                      ],
                      ['Next'],
                    ),
                  ],
                ),
              ],
            ),
          ],
          'h.button([h.OnClick(Message.ChosenStep({ value: step + 1 }))], ["Next"])',
          stacked,
        ),
      ]
    },
  },
]
