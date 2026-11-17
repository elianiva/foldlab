import { Effect, Option, Queue, Schema, Stream } from 'effect'
import { Command, Mount } from 'foldkit'
import type { Attribute, Html, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import { attach, type Binding, type Change, type Snapshot, sync } from './internal/bind.ts'
import { findRegistry, UiRegistry } from './registry.ts'
import { type Attrs, type PartProps, type Primitive, renderPhase } from './internal/render.ts'

// ── Messages ────────────────────────────────────────────────────────────────

/** `component` + `key` say whose state a Message is about. */
export const Message = defineMessageUnion({
  /**
   * An instance accepted a change. Carries every controlled option of that
   * instance, not one pair, so applying it is idempotent and order-independent.
   * `reason` is for policy (refuse, log), never for rebuilding state.
   */
  ChangedUiState: {
    component: Schema.String,
    key: Schema.String,
    snapshot: Schema.Record(Schema.String, Schema.Unknown),
    reason: Schema.String,
  },
  /** Text typed into an input Foldkit owns. Core never sees it. */
  TypedUiText: { component: Schema.String, key: Schema.String, value: Schema.String },
  /**
   * The synchronous guard vetoed a change. The instance did not move. `update`
   * normally ignores it; log it, or show why. `snapshot` is what was asked for.
   */
  RefusedUiChange: {
    component: Schema.String,
    key: Schema.String,
    snapshot: Schema.Record(Schema.String, Schema.Unknown),
    reason: Schema.String,
  },
  CompletedUiSync: {},
})
export type Message = typeof Message.Type

// ── Component description ───────────────────────────────────────────────────

export type Tag = 'div' | 'button' | 'input' | 'label' | 'span' | 'ul' | 'li' | 'p' | 'h2' | 'h3'

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
  /** Option names the Model controls (ui-sdk's `controlled`). */
  controlled: ReadonlyArray<string>
  /** ui-sdk callback option to the controlled option it asks to change. */
  callbacks: Readonly<Record<string, string>>
  /** The slot whose bind takes the document scroll lock. Set it on a modal's content. */
  lockSlot?: Slot
  /** Completion callbacks to the snapshot key they set (`onOpenChangeComplete: 'mounted'`). */
  completions?: Readonly<Record<string, string>>
  /** Internal ui-sdk state the Model owns, patched over a fresh instance in the render phase. */
  renderState?: (state: State) => Readonly<Record<string, unknown>>
  /** Synchronous veto for policy the app knows at view time. Default: allow. */
  guard?: (state: State, snapshot: Snapshot) => boolean
  /** State after a snapshot of controlled options lands. Pure and idempotent. */
  fold: (state: State, snapshot: Snapshot) => State
  /** State after text is typed into the `text` slot. */
  typed?: (state: State, text: string) => State
  /** The slot whose text entry Foldkit owns: `h.Value` and `h.OnInput`, no core `input` handler. */
  text?: Slot
  tags: Readonly<Record<Slot, Tag>>
  /** Slots that need a live element: handlers, focus, observers. The rest stay pure. */
  bound: ReadonlyArray<Slot>
}>

/** Pure and global-free: the Binding the registry holds for a component. */
export const bindingOf = <State, Slot extends string>(
  component: Component<State, Slot>,
): Binding => {
  const decode = Schema.decodeUnknownSync(component.state)
  return {
    primitive: component.primitive,
    options: (state) => component.options(decode(state)),
    controlled: component.controlled,
    callbacks: component.callbacks,
    completions: component.completions ?? {},
    ...(component.lockSlot === undefined ? {} : { lockSlot: component.lockSlot }),
    fold: (state, snapshot) => component.fold(decode(state), snapshot),
    guard: (state, snapshot) => component.guard?.(decode(state), snapshot) ?? true,
    foldkitEvents: component.text === undefined ? {} : { [component.text]: ['input'] },
  }
}

/** Names the shape of a component for the compiler. It registers nothing. */
export const defineComponent = <State, Slot extends string>(
  component: Component<State, Slot>,
): Component<State, Slot> => component

/**
 * Applies a Message to one component's state. It returns the same object when
 * the Message is about another instance. Skip calling it to refuse a change;
 * `syncUiState` then reverts the instance.
 */
export const makeUpdate =
  <State, Slot extends string>(component: Component<State, Slot>) =>
  (state: State, message: Message): State => {
    if (message._tag === 'CompletedUiSync' || message._tag === 'RefusedUiChange') return state
    if (message.component !== component.name || message.key !== component.key(state)) return state
    if (message._tag === 'TypedUiText') return component.typed?.(state, message.value) ?? state
    return component.fold(state, message.snapshot)
  }

// ── Bind phase: Mount ───────────────────────────────────────────────────────

// Args are frozen when the element is inserted. They say which part this is
// and seed the instance; later Model changes arrive through `syncUiState`.
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
        // A Mount cannot `yield*` the Resource: its static requirement is only
        // Scope, and the context it runs in holds Foldkit's own services, not the
        // app's Resources. The layer leaves the same registry on the app's container
        // element, and the Mount finds it from its own element.
        const registry = findRegistry(element)
        const binding = Option.flatMap(registry, (r) =>
          Option.fromNullishOr(r.bindings.get(component)),
        )
        if (
          Option.isNone(registry) ||
          Option.isNone(binding) ||
          !(element instanceof HTMLElement)
        ) {
          console.error(`[foldlab] No UiRegistry binding for "${component}". Provide its layer.`)
          return yield* Effect.never
        }
        yield* Effect.acquireRelease(
          Effect.sync(() =>
            attach(
              registry.value,
              component,
              binding.value,
              key,
              state,
              slot,
              props,
              element,
              (change: Change) => {
                Queue.offerUnsafe(
                  queue,
                  change.refused
                    ? Message.RefusedUiChange({
                        component,
                        key,
                        snapshot: change.snapshot,
                        reason: change.reason,
                      })
                    : Message.ChangedUiState({
                        component,
                        key,
                        snapshot: change.snapshot,
                        reason: change.reason,
                      }),
                )
              },
            ),
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

/** Describes one component's Model slice for `syncUiState`. */
export const specOf = <State, Slot extends string>(
  component: Component<State, Slot>,
  state: State,
): Spec => ({ component: component.name, key: component.key(state), state })

/**
 * Confirms the Model's ui state into the mounted instances. Return it from
 * `update` after every Message that can change ui state. It is a confirmation
 * when the instance already acked the change, and a revert when `update`
 * refused it. A part that is not mounted ignores it.
 */
export const syncUiState = Command.define('SyncUiState', {
  args: { specs: Schema.Array(Spec) },
  messages: [Message.CompletedUiSync],
  execute: ({ specs }) =>
    Effect.gen(function* () {
      const registry = yield* UiRegistry
      for (const spec of specs) sync(registry, spec.component, spec.key, spec.state)
      return Message.CompletedUiSync()
    }),
})

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
    const rendered = renderPhase(
      component.primitive,
      { ...component.options(state), id: key },
      component.renderState?.(state),
    )
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
        const typed =
          slot === component.text
            ? [
                h.OnInput((value: string) =>
                  config.toMessage(Message.TypedUiText({ component: component.name, key, value })),
                ),
              ]
            : []
        const all = [
          ...toAttributes(h, own),
          ...typed,
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
