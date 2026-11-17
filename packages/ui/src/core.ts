import { Effect, Queue, Schema, Stream } from 'effect'
import { Mount, Subscription } from 'foldkit'
import type { Attribute, Html, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import { attach, type Binding, type Change, sync } from './internal/bind.ts'
import { type Attrs, type PartProps, type Primitive, renderPhase } from './internal/render.ts'

// ── Messages ────────────────────────────────────────────────────────────────

/** The only Message ui-sdk produces. `component` + `key` say whose state it is. */
export const Message = defineMessageUnion({
  ChangedUiState: {
    component: Schema.String,
    key: Schema.String,
    name: Schema.String,
    value: Schema.Unknown,
    reason: Schema.String,
  },
})
export type Message = typeof Message.Type

// ── Component description ───────────────────────────────────────────────────

export type Tag = 'div' | 'button' | 'input' | 'label' | 'span' | 'ul' | 'li' | 'p' | 'h3'

export type Component<State, Slot extends string> = Readonly<{
  /** `data-slot` prefix and registry name. */
  name: string
  primitive: Primitive
  /** Schema of the slice of Model this component owns. */
  state: Schema.Codec<State>
  /** Stable identity. Comes from the Model, never from a counter. */
  key: (state: State) => string
  /** Model state to ui-sdk options. Pure. */
  options: (state: State) => Readonly<Record<string, unknown>>
  /** ui-sdk callback option to the state field it asks to change. */
  callbacks: Readonly<Record<string, keyof State & string>>
  tags: Readonly<Record<Slot, Tag>>
  /** Slots that need a live element: handlers, focus, observers. The rest stay pure. */
  bound: ReadonlyArray<Slot>
}>

const bindings = new Map<string, Binding>()

export const defineComponent = <State, Slot extends string>(
  component: Component<State, Slot>,
): Component<State, Slot> => {
  const decode = Schema.decodeUnknownSync(component.state)
  bindings.set(component.name, {
    primitive: component.primitive,
    options: (state) => component.options(decode(state)),
    callbacks: component.callbacks,
  })
  return component
}

// ── Bind phase: Mount ───────────────────────────────────────────────────────

// Args are frozen when the element is inserted. They say which part this is
// and seed the instance; later Model changes arrive through `syncSubscription`.
export const BindPart = Mount.defineStream('BindUiPart', {
  args: {
    component: Schema.String,
    key: Schema.String,
    slot: Schema.String,
    props: Schema.Record(Schema.String, Schema.Unknown),
    state: Schema.Unknown,
  },
  messages: [Message],
  execute: ({ element, component, key, slot, props, state }) =>
    Stream.callback<Message>((queue) =>
      Effect.gen(function* () {
        const binding = bindings.get(component)
        if (binding === undefined || !(element instanceof HTMLElement)) {
          return yield* Effect.never
        }
        yield* Effect.acquireRelease(
          Effect.sync(() =>
            attach(component, binding, key, state, slot, props, element, (change: Change) => {
              Queue.offerUnsafe(queue, Message.ChangedUiState({ component, key, ...change }))
            }),
          ),
          (release) => Effect.sync(release),
        )
        return yield* Effect.never
      }),
    ),
})

// ── Bind phase: Model -> instance ───────────────────────────────────────────

const Spec = Schema.Struct({ component: Schema.String, key: Schema.String, state: Schema.Unknown })
export type Spec = typeof Spec.Type

/** Describes one component's Model slice for `syncSubscription`. */
export const specOf = <State, Slot extends string>(
  component: Component<State, Slot>,
  state: State,
): Spec => ({ component: component.name, key: component.key(state), state })

/**
 * Pushes the Model's ui state into the mounted instances. Declare it once, with
 * every ui-sdk state the Model owns. It does nothing for a part that is not
 * mounted, and an instance never writes back except through a Message.
 */
export const syncSubscription = <Model, AppMessage>(specs: (model: Model) => ReadonlyArray<Spec>) =>
  Subscription.make<Model, AppMessage>()((entry) => ({
    syncUiState: entry(
      { specs: Schema.Array(Spec) },
      {
        modelToDependencies: (model) => ({ specs: specs(model) }),
        dependenciesToStream: ({ specs }) =>
          Stream.fromEffect(
            Effect.sync(() => {
              for (const spec of specs) sync(spec.component, spec.key, spec.state)
            }),
          ).pipe(Stream.drain),
      },
    ),
  }))

// ── Render phase: parts ─────────────────────────────────────────────────────

export type PartsConfig<AppMessage> = Readonly<{
  /** Wraps ui-sdk's Message into the app's. */
  toMessage: (message: Message) => AppMessage
}>

export type Part<AppMessage> = (
  props: PartProps,
  attributes?: ReadonlyArray<Attribute<AppMessage>>,
  children?: ReadonlyArray<Html | string>,
) => Html

export type Parts<AppMessage, Slot extends string> = Readonly<Record<Slot, Part<AppMessage>>> &
  Readonly<{
    /**
     * One part's computed attributes, for wiring it onto an element you render
     * yourself, such as a Field's description and error ids onto a combobox
     * input. `only` names the attributes to keep.
     */
    attributes: (
      slot: Slot,
      props?: PartProps,
      only?: ReadonlyArray<string>,
    ) => ReadonlyArray<Attribute<AppMessage>>
  }>

const toAttributes = <AppMessage>(
  h: HtmlBuilder<AppMessage>,
  attrs: Attrs,
): ReadonlyArray<Attribute<AppMessage>> => {
  const result: Array<Attribute<AppMessage>> = []
  for (const [name, value] of Object.entries(attrs)) {
    if (value === undefined) continue
    result.push(name === 'value' ? h.Value(value) : h.Attribute(name, value))
  }
  return result
}

export const makeParts =
  <State, Slot extends string>(component: Component<State, Slot>) =>
  <AppMessage>(
    state: State,
    h: HtmlBuilder<AppMessage>,
    config: PartsConfig<AppMessage>,
  ): Parts<AppMessage, Slot> => {
    const key = component.key(state)
    const rendered = renderPhase(component.primitive, { ...component.options(state), id: key })
    const part =
      (slot: Slot): Part<AppMessage> =>
      (props, attributes = [], children = []) => {
        if (!rendered.present(slot, props)) return h.empty
        const own = rendered.attrs(slot, props)
        const mount = component.bound.includes(slot)
          ? [
              h.OnMount(
                Mount.mapMessage(
                  BindPart({ component: component.name, key, slot, props, state }),
                  config.toMessage,
                ),
              ),
            ]
          : []
        const all = [
          ...toAttributes(h, own),
          ...(own['id'] ? [h.Key(own['id'])] : []),
          ...attributes,
          ...mount,
        ]
        const tag = component.tags[slot]
        return tag === 'input' ? h.input(all) : h[tag](all, children)
      }
    const attributes = (slot: Slot, props: PartProps = {}, only?: ReadonlyArray<string>) => {
      const own = rendered.attrs(slot, props)
      const kept =
        only === undefined
          ? own
          : Object.fromEntries(Object.entries(own).filter(([name]) => only.includes(name)))
      return toAttributes(h, kept)
    }
    const built = Object.fromEntries(
      (Object.keys(component.tags) as Array<Slot>).map((slot) => [slot, part(slot)]),
    )
    return { ...(built as Record<Slot, Part<AppMessage>>), attributes }
  }
