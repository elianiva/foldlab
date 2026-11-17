import { Effect, Schema } from 'effect'
import { Command, FieldValidation, Update } from 'foldkit'
import { Dialog as FkDialog } from '@foldkit/ui'
import type { Document, Html, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import {
  Accordion,
  Combobox,
  Dialog,
  Field,
  Message as UiMessage,
  Ui,
  UiRegistry,
  stamp,
} from '@foldlab/ui'
import { css } from '../../styled-system/css'

// Every ui-sdk component the page uses. `confirm` sits inside `settings`: two dialogs, two states.
export const kit = Ui.define({
  assigneeBox: Combobox.component,
  channelBox: Combobox.component,
  help: Accordion.component,
  settings: Dialog.component,
  confirm: Dialog.component,
})

// ── Model ───────────────────────────────────────────────────────────────────

const Text = FieldValidation.Field(Schema.String)
const Strings = FieldValidation.Field(Schema.Array(Schema.String))

export const Model = Schema.Struct({
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

export const init = () => ({
  model: Model.make({
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
  maxWidth: '32rem',
  margin: '2rem auto',
})
const group = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
  border: '1px solid',
  padding: '1rem',
})

const ui = { toMessage: (message: UiMessage) => Message.GotUiMessage({ message }) }

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

const textField = (h: HtmlBuilder<Message>, config: TextFieldConfig): Html => {
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

const comboField = (h: HtmlBuilder<Message>, config: ComboFieldConfig): Html => {
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
                      box.item({ value: item.value }, [], [box['item-text']({}, [], [item.label])]),
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
      d.trigger({}, [], ['Open (ui-sdk adapter)']),
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
      h.button([h.Type('button'), h.OnClick(Message.ClickedToggleDialogs())], ['Drop dialogs']),
      h.button(
        [h.Type('button'), h.OnClick(Message.ClickedOpenFkDialog())],
        ['Open (@foldkit/ui)'],
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

export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'foldlab',
  body: h.main(
    [h.Class(stack)],
    [
      h.h1([], ['New project']),
      textField(h, {
        id: 'name',
        label: 'Project name',
        description: 'Lowercase, unique across projects.',
        field: model.name,
        required: FieldValidation.isRequired(rules.name),
        toMessage: (value) => Message.ChangedName({ value }),
      }),
      textField(h, {
        id: 'owner-email',
        label: 'Owner email',
        description: 'Where project notices go.',
        field: model.owner.email,
        required: true,
        type: 'email',
        toMessage: (value) => Message.ChangedEmail({ value }),
      }),
      comboField(h, {
        id: 'owner-assignee',
        label: 'Assignee',
        description: 'Who triages new issues.',
        box: model.ui.assigneeBox,
        field: model.owner.assignee,
        placeholder: 'Search people',
      }),
      textField(h, {
        id: 'schedule-start',
        label: 'Start date',
        description: 'First day of work.',
        field: model.schedule.start,
        required: true,
        type: 'date',
        toMessage: (value) => Message.ChangedStart({ value }),
      }),
      textField(h, {
        id: 'schedule-end',
        label: 'End date',
        description: 'Must not be before the start date.',
        field: model.schedule.end,
        required: true,
        type: 'date',
        toMessage: (value) => Message.ChangedEnd({ value }),
      }),
      comboField(h, {
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
    ],
  ),
})
