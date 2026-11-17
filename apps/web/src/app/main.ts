import { Effect, Queue, Schema, Stream } from 'effect'
import { Command, FieldValidation, Subscription, Update } from 'foldkit'
import { Dialog as FkDialog } from '@foldkit/ui'
import type { Document, Html, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import {
  Accordion,
  Checkbox,
  Collapsible,
  Combobox,
  Dialog,
  Field,
  Menu,
  Message as UiMessage,
  Popover,
  Radio,
  Select,
  Slider,
  Switch,
  Tabs,
  Tooltip,
  Ui,
  UiRegistry,
  type PartsConfig,
  stamp,
} from '@foldlab/ui'
import { css } from '../../styled-system/css'
import { shell } from '../gallery/layout.ts'
import { FORM_PAGE, galleryPages, pageOfHash } from '../gallery/pages.ts'

// Every ui-sdk component the page uses. `confirm` sits inside `settings`: two dialogs, two states.
export const kit = Ui.define({
  assigneeBox: Combobox.component,
  channelBox: Combobox.component,
  help: Accordion.component,
  settings: Dialog.component,
  confirm: Dialog.component,
  checkOn: Checkbox.component,
  checkOff: Checkbox.component,
  checkDisabled: Checkbox.component,
  switchOn: Switch.component,
  switchOff: Switch.component,
  switchDisabled: Switch.component,
  plan: Radio.component,
  tabs: Tabs.component,
  collapse: Collapsible.component,
  slider: Slider.component,
  tip: Tooltip.component,
  pop: Popover.component,
  menu: Menu.component,
  region: Select.component,
})

// ── Model ───────────────────────────────────────────────────────────────────

const Text = FieldValidation.Field(Schema.String)
const Strings = FieldValidation.Field(Schema.Array(Schema.String))

// The id `kit.layer(container)` returned. The entry puts it in Flags, so no view guesses it.
export const Flags = Schema.Struct({ anchorId: Schema.String, page: Schema.String })
export type Flags = typeof Flags.Type

export const Model = Schema.Struct({
  anchorId: Schema.String,
  /** The gallery page, from the URL hash. */
  page: Schema.String,
  demo: Schema.Struct({
    loading: Schema.Boolean,
    pagination: Schema.Finite,
    revealed: Schema.Boolean,
  }),
  name: Text,
  owner: Schema.Struct({ email: Text, assignee: Text }),
  schedule: Schema.Struct({ start: Text, end: Text }),
  channels: Strings,
  // ui-sdk state lives in the Model as plain data, next to the validation state.
  ui: kit.Model,
  // The same dialog, once more, from @foldkit/ui.
  dialogsVisible: Schema.Boolean,
  fkDialog: FkDialog.Model,
  submitted: Schema.Boolean,
})
export type Model = typeof Model.Type

const people: ReadonlyArray<Combobox.Item> = [
  { value: 'ada', label: 'Ada Lovelace' },
  { value: 'grace', label: 'Grace Hopper' },
  { value: 'alan', label: 'Alan Turing' },
  { value: 'linus', label: 'Linus Torvalds' },
]
const channelItems: ReadonlyArray<Combobox.Item> = [
  { value: 'email', label: 'Email' },
  { value: 'slack', label: 'Slack' },
  { value: 'sms', label: 'SMS' },
]
const takenNames: ReadonlyArray<string> = ['foldkit', 'panda', 'ui-sdk']

// ── Validation ──────────────────────────────────────────────────────────────

export const rules = {
  name: FieldValidation.makeRules({
    required: 'Name is required',
    rules: [
      FieldValidation.Rule.minLength(3, 'Use at least 3 characters'),
      FieldValidation.Rule.pattern(/^[a-z0-9-]+$/, 'Use lowercase letters, digits and hyphens'),
    ],
  }),
  email: FieldValidation.makeRules({
    required: 'Owner email is required',
    rules: [FieldValidation.Rule.email('Enter a valid email')],
  }),
  assignee: FieldValidation.makeRules({ required: 'Pick an assignee' }),
  start: FieldValidation.makeRules({ required: 'Start date is required' }),
  // Cross-field: the end rules are a function of the start value.
  end: (start: string) =>
    FieldValidation.makeRules({
      required: 'End date is required',
      rules: [[(end: string) => start === '' || end >= start, 'End must not be before start']],
    }),
  channels: FieldValidation.makeRules<ReadonlyArray<string>>({
    required: 'Pick at least one channel',
  }),
}

// ── Messages ────────────────────────────────────────────────────────────────

export const Message = defineMessageUnion({
  ChangedName: { value: Schema.String },
  ChangedEmail: { value: Schema.String },
  ChangedStart: { value: Schema.String },
  ChangedEnd: { value: Schema.String },
  GotNameAvailability: { name: Schema.String, taken: Schema.Boolean },
  GotUiMessage: { message: UiMessage },
  GotFkDialog: { message: FkDialog.Message },
  ClickedOpenFkDialog: {},
  ClickedToggleDialogs: {},
  ClickedSubmit: {},
  ChangedPage: { page: Schema.String },
  ToggledLoading: {},
  ToggledReveal: {},
  ChangedDemoPage: { value: Schema.Finite },
})
export type Message = typeof Message.Type

export const CheckName = Command.define('CheckName', {
  args: { name: Schema.String },
  messages: [Message.GotNameAvailability],
  execute: ({ name }) =>
    Effect.sleep('400 millis').pipe(
      Effect.as(Message.GotNameAvailability({ name, taken: takenNames.includes(name) })),
    ),
})

// ── Init / update ───────────────────────────────────────────────────────────

export const init = (flags: Flags) => ({
  model: Model.make({
    anchorId: flags.anchorId,
    page: flags.page,
    demo: { loading: false, pagination: 1, revealed: false },
    name: FieldValidation.NotValidated({ value: '' }),
    owner: {
      email: FieldValidation.NotValidated({ value: '' }),
      assignee: FieldValidation.NotValidated({ value: '' }),
    },
    schedule: {
      start: FieldValidation.NotValidated({ value: '' }),
      end: FieldValidation.NotValidated({ value: '' }),
    },
    channels: FieldValidation.NotValidated({ value: [] }),
    ui: {
      assigneeBox: Combobox.init({ key: 'assignee', items: people }),
      channelBox: Combobox.init({ key: 'channels', items: channelItems, multiple: true }),
      help: Accordion.init({ key: 'help', multiple: true }),
      settings: Dialog.init({ key: 'settings', described: true }),
      confirm: Dialog.init({ key: 'confirm', described: false }),
      checkOn: Checkbox.init({ key: 'check-on', checked: true }),
      checkOff: Checkbox.init({ key: 'check-off' }),
      checkDisabled: Checkbox.init({ key: 'check-disabled', disabled: true }),
      switchOn: Switch.init({ key: 'switch-on', checked: true }),
      switchOff: Switch.init({ key: 'switch-off' }),
      switchDisabled: Switch.init({ key: 'switch-disabled', disabled: true }),
      plan: Radio.init({ key: 'plan', value: 'pro' }),
      tabs: Tabs.init({ key: 'tabs', value: 'overview' }),
      collapse: Collapsible.init({ key: 'collapse' }),
      slider: Slider.init({ key: 'slider', value: [40] }),
      tip: Tooltip.init({ key: 'tip' }),
      pop: Popover.init({ key: 'pop' }),
      menu: Menu.init({ key: 'menu' }),
      region: Select.init({
        key: 'region',
        items: [
          { value: 'us-east', label: 'US East' },
          { value: 'eu-west', label: 'EU West' },
          { value: 'ap-south', label: 'Asia Pacific' },
        ],
      }),
    },
    dialogsVisible: true,
    fkDialog: FkDialog.init({ id: 'fk-settings', isAnimated: true }),
    submitted: false,
  }),
})

const nameWithAvailability = (value: string) => {
  const next = FieldValidation.validate(rules.name)(value)
  return next._tag === 'Valid' ? FieldValidation.Validating({ value }) : next
}

// A name the server already approved stays Valid; everything else re-runs.
const revalidateName = (model: Model) =>
  model.name._tag === 'Valid' ? model.name : FieldValidation.validate(rules.name)(model.name.value)

export const isFormValid = (model: Model) =>
  FieldValidation.isValid(rules.name)(model.name) &&
  FieldValidation.isValid(rules.email)(model.owner.email) &&
  FieldValidation.isValid(rules.assignee)(model.owner.assignee) &&
  FieldValidation.isValid(rules.start)(model.schedule.start) &&
  FieldValidation.isValid(rules.end(model.schedule.start.value))(model.schedule.end) &&
  FieldValidation.isValid(rules.channels)(model.channels)

export const update = (model: Model, message: Message): Update.Return<Model, Message, UiRegistry> =>
  Message.match<Update.Return<Model, Message, UiRegistry>>(message, {
    ChangedName: ({ value }) => {
      const name = nameWithAvailability(value)
      return {
        model: { ...model, name, submitted: false },
        commands: name._tag === 'Validating' ? [CheckName({ name: value })] : [],
      }
    },
    GotNameAvailability: ({ name, taken }) => ({
      // A late answer for an old value must not overwrite a newer one.
      model:
        model.name._tag === 'Validating' && model.name.value === name
          ? {
              ...model,
              name: taken
                ? FieldValidation.Invalid({ value: name, errors: [`"${name}" is already taken`] })
                : FieldValidation.Valid({ value: name }),
            }
          : model,
    }),
    ChangedEmail: ({ value }) => ({
      model: {
        ...model,
        owner: { ...model.owner, email: FieldValidation.validate(rules.email)(value) },
      },
    }),
    ChangedStart: ({ value }) => {
      const endTouched = model.schedule.end._tag !== 'NotValidated'
      return {
        model: {
          ...model,
          schedule: {
            start: FieldValidation.validate(rules.start)(value),
            // Changing start re-checks end, once end has been touched.
            end: endTouched
              ? FieldValidation.validate(rules.end(value))(model.schedule.end.value)
              : model.schedule.end,
          },
        },
      }
    },
    ChangedEnd: ({ value }) => ({
      model: {
        ...model,
        schedule: {
          ...model.schedule,
          end: FieldValidation.validate(rules.end(model.schedule.start.value))(value),
        },
      },
    }),
    GotUiMessage: ({ message: child }) => {
      const result = kit.update(model.ui, child)
      const assigneeValue = result.model.assigneeBox.value[0] ?? ''
      const assigneeChanged = assigneeValue !== (model.ui.assigneeBox.value[0] ?? '')
      const channelsChanged =
        result.model.channelBox.value.join() !== model.ui.channelBox.value.join()
      return {
        model: {
          ...model,
          ui: result.model,
          owner: assigneeChanged
            ? { ...model.owner, assignee: FieldValidation.validate(rules.assignee)(assigneeValue) }
            : model.owner,
          channels: channelsChanged
            ? FieldValidation.validate(rules.channels)(result.model.channelBox.value)
            : model.channels,
        },
        commands: Command.mapMessages(result.commands, (message) =>
          Message.GotUiMessage({ message }),
        ),
      }
    },
    GotFkDialog: ({ message: child }) => {
      const result = FkDialog.update(model.fkDialog, child)
      return {
        model: { ...model, fkDialog: result.model },
        commands: Command.mapMessages(result.commands ?? [], (message) =>
          Message.GotFkDialog({ message }),
        ),
      }
    },
    // Unmounts every dialog at once, open or closing: the page-navigation case.
    ClickedToggleDialogs: () => ({
      model: {
        ...model,
        dialogsVisible: !model.dialogsVisible,
        ui: {
          ...model.ui,
          settings: Dialog.init({ key: 'settings', described: true }),
          confirm: Dialog.init({ key: 'confirm', described: false }),
        },
      },
    }),
    ClickedOpenFkDialog: () => {
      const result = FkDialog.open(model.fkDialog)
      return {
        model: { ...model, fkDialog: result.model },
        commands: Command.mapMessages(result.commands ?? [], (message) =>
          Message.GotFkDialog({ message }),
        ),
      }
    },
    ChangedPage: ({ page }) => ({ model: { ...model, page } }),
    ToggledLoading: () => ({
      model: { ...model, demo: { ...model.demo, loading: !model.demo.loading } },
    }),
    ToggledReveal: () => ({
      model: { ...model, demo: { ...model.demo, revealed: !model.demo.revealed } },
    }),
    ChangedDemoPage: ({ value }) => ({
      model: { ...model, demo: { ...model.demo, pagination: value } },
    }),
    ClickedSubmit: () => {
      const next = {
        ...model,
        name: model.name._tag === 'Validating' ? model.name : revalidateName(model),
        owner: {
          email: FieldValidation.validate(rules.email)(model.owner.email.value),
          assignee: FieldValidation.validate(rules.assignee)(model.owner.assignee.value),
        },
        schedule: {
          start: FieldValidation.validate(rules.start)(model.schedule.start.value),
          end: FieldValidation.validate(rules.end(model.schedule.start.value))(
            model.schedule.end.value,
          ),
        },
        channels: FieldValidation.validate(rules.channels)(model.channels.value),
      }
      return { model: { ...next, submitted: isFormValid(next) } }
    },
  })

// ── View ────────────────────────────────────────────────────────────────────

const stack = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  maxWidth: '36rem',
  width: '100%',
})
const group = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  borderRadius: 'calc(var(--radius) * 1.4)',
  background: 'var(--card)',
  boxShadow: 'var(--elev-card)',
  padding: '1rem 1.1rem',
})
const row = css({ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' })

const uiOf = (model: Model): PartsConfig<Message> => ({
  toMessage: (message: UiMessage) => Message.GotUiMessage({ message }),
  anchor: model.anchorId,
})

const status = (h: HtmlBuilder<Message>, text: string): Html =>
  h.p([h.Role('status'), h.AriaLive('polite')], [text])

type TextFieldConfig = Readonly<{
  id: string
  label: string
  description: string
  field: FieldValidation.Field<string>
  required: boolean
  type?: string
  toMessage: (value: string) => Message
}>

const textField = (
  h: HtmlBuilder<Message>,
  ui: PartsConfig<Message>,
  config: TextFieldConfig,
): Html => {
  const field = Field.parts(
    Field.init({ key: config.id, invalid: FieldValidation.isInvalid(config.field) }),
    h,
    ui,
  )
  return field.root(
    {},
    [h.Class(group)],
    [
      field.label({}, [], [config.required ? `${config.label} *` : config.label]),
      // OnInput is Foldkit's. The control is a plain input, so core has no handler to collide with.
      field.control(
        {},
        [h.Type(config.type ?? 'text'), h.Value(config.field.value), h.OnInput(config.toMessage)],
        [],
      ),
      field.description({}, [], [config.description]),
      FieldValidation.match(config.field, {
        onNotValidated: () => null,
        onValidating: () => status(h, 'Checking availability…'),
        onValid: () => null,
        onInvalid: ({ errors }) => field.error({}, [], [errors.join('. ')]),
      }),
    ],
  )
}

type ComboFieldConfig = Readonly<{
  id: string
  label: string
  description: string
  box: Combobox.State
  field: FieldValidation.Field<unknown>
  placeholder: string
}>

const comboField = (
  h: HtmlBuilder<Message>,
  ui: PartsConfig<Message>,
  config: ComboFieldConfig,
): Html => {
  const field = Field.parts(
    Field.init({ key: config.id, invalid: FieldValidation.isInvalid(config.field) }),
    h,
    ui,
  )
  const box = Combobox.parts(config.box, h, ui)
  const visible = Combobox.visibleItems(config.box)
  return field.root(
    {},
    [h.Class(group)],
    [
      box.root(
        {},
        [],
        [
          box.label({}, [], [config.label]),
          // The combobox owns the input's id and keyboard; the Field contributes
          // only its describedby / invalid wiring.
          box.input(
            {},
            [
              h.Placeholder(config.placeholder),
              ...field.attributes('control', {}, [
                'aria-describedby',
                'aria-invalid',
                'data-invalid',
              ]),
            ],
            [],
          ),
          box.content(
            {},
            [],
            [
              box.list(
                {},
                [],
                visible.length === 0
                  ? [box.empty({}, [], ['No matches'])]
                  : visible.map((item) =>
                      box.item(
                        { value: item.value, label: item.label },
                        [],
                        [box['item-text']({ text: item.label }, [], [item.label])],
                      ),
                    ),
              ),
            ],
          ),
        ],
      ),
      config.box.multiple
        ? h.p(
            [],
            [
              `Selected: ${config.box.value.map((value) => Combobox.labelOf(config.box, value)).join(', ') || 'none'}`,
            ],
          )
        : null,
      field.description({}, [], [config.description]),
      config.field._tag === 'Invalid'
        ? field.error({}, [], [config.field.errors.join('. ')])
        : null,
    ],
  )
}

const helpSection = (h: HtmlBuilder<Message>, model: Model): Html => {
  const ui = uiOf(model)
  const accordion = Accordion.parts(model.ui.help, h, ui)
  const item = (value: string, title: string, body: string) =>
    accordion.item(
      { value },
      [],
      [
        accordion.header({}, [], [accordion.trigger({ value }, [], [title])]),
        accordion.panel({ value }, [], [h.p([], [body])]),
      ],
    )
  return accordion.root(
    {},
    [],
    [
      item(
        'names',
        'Why is my name taken?',
        `Names are checked against existing projects: ${takenNames.join(', ')}.`,
      ),
      item('dates', 'Date rules', 'The end date must not be before the start date.'),
    ],
  )
}

const dialogs = (h: HtmlBuilder<Message>, model: Model): Html => {
  const ui = uiOf(model)
  const d = Dialog.parts(model.ui.settings, h, ui)
  const c = Dialog.parts(model.ui.confirm, h, ui)
  if (!model.dialogsVisible) {
    return h.section(
      [h.Class(group)],
      [
        h.button(
          [h.Type('button'), h.OnClick(Message.ClickedToggleDialogs())],
          ['Restore dialogs'],
        ),
      ],
    )
  }
  return h.section(
    [h.Class(group)],
    [
      h.h2([], ['Dialogs']),
      h.div(
        [h.Class(row)],
        [
          d.trigger({}, [], ['Open (ui-sdk adapter)']),
          h.button(
            [h.Type('button'), h.OnClick(Message.ClickedOpenFkDialog())],
            ['Open (@foldkit/ui)'],
          ),
          h.button([h.Type('button'), h.OnClick(Message.ClickedToggleDialogs())], ['Drop dialogs']),
        ],
      ),
      d.backdrop({}, [], []),
      d.content(
        {},
        [],
        [
          d.title({}, [], ['Project settings']),
          d.description({}, [], ['Rendered through @foldlab/ui.']),
          c.trigger({}, [], ['Delete project']),
          c.backdrop({}, [], []),
          c.content({}, [], [c.title({}, [], ['Delete project?']), c.close({}, [], ['Cancel'])]),
          d.close({}, [], ['Close']),
        ],
      ),
      h.submodel({
        slotId: 'fk-settings',
        model: model.fkDialog,
        view: FkDialog.view,
        toParentMessage: (message) => Message.GotFkDialog({ message }),
        viewInputs: {
          hasDescription: true,
          // Our data-slot goes on the attribute arrays @foldkit/ui hands us.
          toView: (r) =>
            h.dialog(
              [...r.dialog],
              [
                h.div([...r.backdrop, ...stamp(h, 'dialog-backdrop')], []),
                h.div(
                  [...r.panel, ...stamp(h, 'dialog-content')],
                  [
                    h.h2([...r.title, ...stamp(h, 'dialog-title')], ['Project settings']),
                    h.p(
                      [...r.description, ...stamp(h, 'dialog-description')],
                      ['Rendered through @foldkit/ui.'],
                    ),
                    h.button(
                      [...r.closeButton, ...r.initialFocus, ...stamp(h, 'dialog-close')],
                      ['Close'],
                    ),
                  ],
                ),
              ],
            ),
        },
      }),
    ],
  )
}

const formPage = (
  h: HtmlBuilder<Message>,
  model: Model,
  ui: PartsConfig<Message>,
): ReadonlyArray<Html> => [
  textField(h, ui, {
    id: 'name',
    label: 'Project name',
    description: 'Lowercase, unique across projects.',
    field: model.name,
    required: FieldValidation.isRequired(rules.name),
    toMessage: (value) => Message.ChangedName({ value }),
  }),
  textField(h, ui, {
    id: 'owner-email',
    label: 'Owner email',
    description: 'Where project notices go.',
    field: model.owner.email,
    required: true,
    type: 'email',
    toMessage: (value) => Message.ChangedEmail({ value }),
  }),
  comboField(h, ui, {
    id: 'owner-assignee',
    label: 'Assignee',
    description: 'Who triages new issues.',
    box: model.ui.assigneeBox,
    field: model.owner.assignee,
    placeholder: 'Search people',
  }),
  textField(h, ui, {
    id: 'schedule-start',
    label: 'Start date',
    description: 'First day of work.',
    field: model.schedule.start,
    required: true,
    type: 'date',
    toMessage: (value) => Message.ChangedStart({ value }),
  }),
  textField(h, ui, {
    id: 'schedule-end',
    label: 'End date',
    description: 'Must not be before the start date.',
    field: model.schedule.end,
    required: true,
    type: 'date',
    toMessage: (value) => Message.ChangedEnd({ value }),
  }),
  comboField(h, ui, {
    id: 'channels',
    label: 'Notification channels',
    description: 'Pick one or more.',
    box: model.ui.channelBox,
    field: model.channels,
    placeholder: 'Search channels',
  }),
  h.button([h.Type('button'), h.OnClick(Message.ClickedSubmit())], ['Create project']),
  model.submitted ? status(h, 'Project created.') : null,
  helpSection(h, model),
  dialogs(h, model),
]

export const subscriptions = Subscription.make<Model, Message>()((entry) => ({
  hash: entry(
    { on: Schema.Boolean },
    {
      modelToDependencies: () => ({ on: true }),
      dependenciesToStream: () =>
        Stream.callback<Message>((queue) =>
          Effect.acquireRelease(
            Effect.sync(() => {
              const listener = () =>
                Queue.offerUnsafe(queue, Message.ChangedPage({ page: pageOfHash(location.hash) }))
              addEventListener('hashchange', listener)
              return listener
            }),
            (listener) => Effect.sync(() => removeEventListener('hashchange', listener)),
          ).pipe(Effect.andThen(Effect.never)),
        ),
    },
  ),
}))

export const view = (model: Model, h: HtmlBuilder<Message>): Document => {
  const ui = uiOf(model)
  const groups = [
    { name: 'Examples', entries: [{ id: FORM_PAGE, title: 'Project form' }] },
    {
      name: 'Components',
      entries: galleryPages.map(({ id, title }) => ({ id, title })),
    },
  ]
  const page = galleryPages.find((entry) => entry.id === model.page)
  const isForm = model.page === FORM_PAGE || page === undefined
  return {
    title: 'foldlab',
    body: shell(
      h,
      {
        current: isForm ? FORM_PAGE : model.page,
        groups,
        title: isForm ? 'Project form' : (page?.title ?? ''),
        description: isForm
          ? 'Nested fields, cross-field and async validation, a combobox and a multi-select, all through the adapter.'
          : (page?.description ?? ''),
      },
      isForm
        ? [h.div([h.Class(stack)], formPage(h, model, ui))]
        : (page?.render({ h, model, ui }) ?? []),
    ),
  }
}
