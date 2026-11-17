// Render benchmark: one combobox per row. Open /bench.html?rows=50.
import { Schema } from 'effect'
import { Runtime } from 'foldkit'
import type { Document, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import { Combobox, Message as UiMessage, Ui } from '@foldlab/ui'
import './styles.css'

const root = document.getElementById('root') ?? document.body
const rows = Number(new URLSearchParams(location.search).get('rows') ?? 50)
const items = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
  { value: 'c', label: 'Gamma' },
]

const Model = Schema.Struct({ boxes: Schema.Array(Combobox.State), ticks: Schema.Finite })
type Model = typeof Model.Type
const Message = defineMessageUnion({
  GotUiMessage: { message: UiMessage },
  Tick: {},
})
type Message = typeof Message.Type

const lift = (message: UiMessage) => Message.GotUiMessage({ message })
const timings: Array<number> = []

const view = (model: Model, h: HtmlBuilder<Message>): Document => {
  const start = performance.now()
  const body = h.main(
    [],
    [
      h.button([h.Id('tick'), h.OnClick(Message.Tick())], ['tick']),
      ...model.boxes.map((box) => {
        const parts = Combobox.parts(box, h, { toMessage: lift })
        return parts.root(
          {},
          [],
          [
            parts.input({}, [], []),
            parts.content(
              {},
              [],
              [
                parts.list(
                  {},
                  [],
                  items.map((item) => parts.item({ value: item.value }, [], [item.label])),
                ),
              ],
            ),
          ],
        )
      }),
    ],
  )
  timings.push(performance.now() - start)
  ;(window as unknown as Record<string, unknown>)['__timings'] = timings
  return { title: 'bench', body }
}

const init = () => ({
  model: Model.make({
    boxes: Array.from({ length: rows }, (_, i) => Combobox.init({ key: `row-${i}`, items })),
    ticks: 0,
  }),
})

const update = (model: Model, message: Message) =>
  Message.match<{ model: Model; commands?: ReadonlyArray<never> }>(message, {
    Tick: () => ({ model: { ...model, ticks: model.ticks + 1 } }),
    GotUiMessage: ({ message: ui }) => ({
      model: {
        ...model,
        boxes: model.boxes.map((box) => Combobox.update(box, ui)),
      },
    }),
  })

Runtime.run(
  Runtime.makeApplication({
    Model,
    init,
    update: update as never,
    view,
    container: root,
    resources: Ui.layerOf([Combobox.component], root).layer,
    slow: false,
  }),
)
