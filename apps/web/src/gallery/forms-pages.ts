import {
  Button,
  Checkbox,
  DateInput,
  Field,
  FileInput,
  Input,
  joinField,
  Label,
  NumberInput,
  PasswordInput,
  Radio,
  Rating,
  Slider,
  Switch,
  Textarea,
  TimeInput,
  TokenInput,
  Toggle,
  hiddenInputs,
} from '@foldlab/adapter'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { css } from '../../styled-system/css'
import type { Message } from '../app/main.ts'
import { sectionOf, stacked } from './layout.ts'
import type { Page } from './types.ts'

const rowCls = css({ display: 'inline-flex', alignItems: 'center', gap: '0.55rem' })

const choice = (h: HtmlBuilder<Message>, control: Html, text: string): Html =>
  h.label([h.Class(rowCls)], [control, h.span([], [text])])

type Pair = readonly [string, string]
const dump = (h: HtmlBuilder<Message>, pairs: ReadonlyArray<Pair>): Html =>
  h.p([h.Attribute('data-slot', 'form-dump')], [pairs.map(([n, v]) => `${n}=${v}`).join('  ')])

export const formsPages: ReadonlyArray<Page> = [
  {
    id: 'button',
    title: 'Button (ui-sdk)',
    description:
      'A button on the ui-sdk primitive. Presses are Foldkit events; the part binds nothing.',
    render: ({ h, ui }) => {
      const run = Button.parts(Button.init({ key: 'form-button' }), h, ui)
      const off = Button.parts(Button.init({ key: 'form-button-off', disabled: true }), h, ui)
      return [
        sectionOf(
          h,
          'States',
          [run.root({}, [], ['Save']), off.root({}, [], ['Disabled'])],
          "Button.parts(Button.init({ key: 'save' }), h, ui).root({}, [h.OnClick(...)], ['Save'])",
        ),
      ]
    },
  },
  {
    id: 'label',
    title: 'Label (ui-sdk)',
    description: 'A native label that names a control.',
    render: ({ h, ui }) => {
      const label = Label.parts(Label.init({ key: 'form-label' }), h, ui)
      return [
        sectionOf(
          h,
          'Basic',
          [
            label.root({}, [h.For('form-label-input')], ['Display name']),
            h.input([h.Id('form-label-input')]),
          ],
          "label.root({}, [h.For('name')], ['Display name'])",
          stacked,
        ),
      ]
    },
  },
  {
    id: 'input',
    title: 'Input (ui-sdk)',
    description:
      'A text input whose value is in the Model. Typing is Foldkit’s; inside a Field it takes the label, description and error ids.',
    render: ({ h, model, ui }) => {
      const state = model.ui.formName
      const input = Input.parts(state, h, ui)
      const invalid = state.value.trim() === ''
      const field = Field.parts(Field.init({ key: 'form-field', invalid }), h, ui)
      return [
        sectionOf(
          h,
          'Bound value',
          [input.root({}, [h.Placeholder('Name')], []), h.p([], [`Value: ${state.value}`])],
          "input.root({}, [h.Placeholder('Name')], [])",
          stacked,
        ),
        sectionOf(
          h,
          'In a Field',
          [
            field.root(
              {},
              [],
              [
                field.label({}, [], ['Name']),
                input.root({}, joinField(field), []),
                field.description({}, [], ['Shown on your profile.']),
                invalid ? field.error({}, [], ['A name is required.']) : null,
              ],
            ),
          ],
          'input.root({}, joinField(field), [])',
          stacked,
        ),
      ]
    },
  },
  {
    id: 'textarea',
    title: 'Textarea (ui-sdk)',
    description: 'A multi-line text control. It grows with its text through CSS.',
    render: ({ h, model, ui }) => {
      const state = model.ui.formNotes
      const area = Textarea.parts(state, h, ui)
      return [
        sectionOf(
          h,
          'Basic',
          [area.root({}, [h.Placeholder('Notes')]), h.p([], [`${state.value.length} characters`])],
          "area.root({}, [h.Placeholder('Notes')])",
          stacked,
        ),
      ]
    },
  },
  {
    id: 'number-input',
    title: 'Number Input',
    description:
      'A number with step buttons, arrow keys and wheel. The Model holds the number and the typed text.',
    render: ({ h, model, ui }) => {
      const state = model.ui.formQuantity
      const n = NumberInput.parts(state, h, ui)
      return [
        sectionOf(
          h,
          'Bounded',
          [
            n.root(
              {},
              [],
              [
                n.group(
                  {},
                  [],
                  [n.decrement({}, [], ['−']), n.control({}, [], []), n.increment({}, [], ['+'])],
                ),
              ],
            ),
            h.p([], [`Value: ${state.value ?? 'none'}`]),
          ],
          'n.root({}, [], [n.group({}, [], [n.decrement(...), n.control({}, [], []), n.increment(...)])])',
          stacked,
        ),
      ]
    },
  },
  {
    id: 'password-input',
    title: 'Password Input',
    description: 'A password control with a visibility toggle.',
    render: ({ h, model, ui }) => {
      const state = model.ui.formPassword
      const p = PasswordInput.parts(state, h, ui)
      return [
        sectionOf(
          h,
          'Toggle',
          [
            p.root(
              {},
              [],
              [p.control({}, [], []), p.toggle({}, [], [state.visible ? 'Hide' : 'Show'])],
            ),
          ],
          "p.root({}, [], [p.control({}, [], []), p.toggle({}, [], ['Show'])])",
          stacked,
        ),
      ]
    },
  },
  {
    id: 'time-input',
    title: 'Time Input',
    description: 'A time, one segment at a time. The value is HH:mm.',
    render: ({ h, model, ui }) => {
      const state = model.ui.formTime
      const t = TimeInput.parts(state, h, ui)
      return [
        sectionOf(
          h,
          'Basic',
          [
            t.root(
              {},
              [],
              [
                ...TimeInput.segments(state).map((segment) => t.segment({ segment }, [], [])),
                t['hidden-input']({}, [], []),
              ],
            ),
            h.p([], [`Value: ${state.value ?? 'empty'}`]),
          ],
          't.root({}, [], segments.map(segment => t.segment({ segment }, [], [])))',
          stacked,
        ),
      ]
    },
  },
  {
    id: 'date-input',
    title: 'Date Input',
    description: 'A date, one segment at a time. The value is an ISO date.',
    render: ({ h, model, ui }) => {
      const state = model.ui.formDate
      const d = DateInput.parts(state, h, ui)
      return [
        sectionOf(
          h,
          'Basic',
          [
            d.root(
              {},
              [],
              [
                ...DateInput.segments(state).map((segment) => d.segment({ segment }, [], [])),
                d['hidden-input']({}, [], []),
              ],
            ),
            h.p([], [`Value: ${state.value ?? 'empty'}`]),
          ],
          'd.root({}, [], segments.map(segment => d.segment({ segment }, [], [])))',
          stacked,
        ),
      ]
    },
  },
  {
    id: 'token-input',
    title: 'Token Input',
    description:
      'Text with inline tokens, edited in one field. Core owns the editor’s content once it binds.',
    render: ({ h, model, ui }) => {
      const state = model.ui.formTags
      const t = TokenInput.parts(state, h, ui)
      return [
        sectionOf(
          h,
          'Mentions',
          [
            t.root(
              {},
              [],
              [t.editor({ placeholder: 'Type a message' }, [h.InnerHTML(state.initial)], [])],
            ),
            h.p([], [`Text: ${TokenInput.textOf(state)}`]),
          ],
          't.root({}, [], [t.editor({ placeholder }, [h.InnerHTML(state.initial)], [])])',
          stacked,
        ),
      ]
    },
  },
  {
    id: 'rating',
    title: 'Rating',
    description: 'Stars as a radio group. Half steps work with step 0.5.',
    render: ({ h, model, ui }) => {
      const stars = (state: typeof model.ui.formRating): Html => {
        const r = Rating.parts(state, h, ui)
        return r.root(
          {},
          [],
          Array.from({ length: state.max }, (_, at) =>
            r.item(
              { index: at + 1 },
              [],
              [
                '★',
                ...Rating.itemValues(state, at + 1).flatMap((value) => [
                  r.radio({ value }, [], []),
                  r.input({ value }, [], []),
                ]),
              ],
            ),
          ),
        )
      }
      return [
        sectionOf(
          h,
          'Whole stars, in a form',
          [stars(model.ui.formRating), h.p([], [`Value: ${model.ui.formRating.value ?? 'none'}`])],
          'r.item({ index }, [], [r.radio({ value }, [], []), r.input({ value }, [], [])])',
          stacked,
        ),
        sectionOf(
          h,
          'Half steps',
          [
            stars(model.ui.formRatingHalf),
            h.p([], [`Value: ${model.ui.formRatingHalf.value ?? 'none'}`]),
          ],
          'Rating.itemValues(state, index) // ["0.5", "1"]',
          stacked,
        ),
      ]
    },
  },
  {
    id: 'form-submission',
    title: 'Form Submission',
    description:
      'Controls with a name add hidden inputs, so a native form submits them. Groups follow the Model.',
    render: ({ h, model, ui }) => {
      const check = Checkbox.parts(model.ui.formCheck, h, ui)
      const sw = Switch.parts(model.ui.formSwitch, h, ui)
      const plan = Radio.parts(model.ui.formPlan, h, ui)
      const slider = Slider.parts(model.ui.formSlider, h, ui)
      const group = Checkbox.groupParts(
        Checkbox.groupInit({ key: 'form-check-group', value: ['a', 'c'], name: 'letters' }),
        h,
        ui,
      )
      const toggles = Toggle.groupParts(
        Toggle.groupInit({ key: 'form-toggle-group', value: ['bold'], multiple: true }),
        h,
        ui,
      )
      const icon = Toggle.parts(Toggle.init({ key: 'form-toggle-icon', pressed: true }), h, ui)
      return [
        sectionOf(
          h,
          'Hidden inputs',
          [
            choice(h, check.root({}, [], [check.indicator({}, [], ['✓'])]), 'Newsletter'),
            check.input({}, [], []),
            choice(h, sw.root({}, [], [sw.thumb({}, [], [])]), 'Dark mode'),
            sw.input({}, [], []),
            plan.group(
              {},
              [],
              ['free', 'pro'].map((value) =>
                choice(h, plan.root({ value }, [], [plan.indicator({ value }, [], [])]), value),
              ),
            ),
            plan.input({ value: 'pro' }, [], []),
            slider.root(
              {},
              [],
              [
                slider.control(
                  {},
                  [],
                  [
                    slider.track(
                      {},
                      [],
                      [
                        slider.indicator({}, [], []),
                        slider.thumb(
                          { index: 0 },
                          [],
                          [slider['thumb-input']({ index: 0 }, [h.AriaLabel('Volume')], [])],
                        ),
                      ],
                    ),
                  ],
                ),
                slider.value({}, [], [String(model.ui.formSlider.value[0] ?? 0)]),
                slider.input({}, [], []),
              ],
            ),
          ],
          'check.root({}, [], [...]), check.input({}, [], [])',
          stacked,
        ),
        sectionOf(
          h,
          'hiddenInputs for your own controls',
          [...hiddenInputs(h, { name: 'tags', values: ['a', 'b'] }), dump(h, [['tags', 'a, b']])],
          "hiddenInputs(h, { name: 'tags', values: ['a', 'b'] })",
        ),
        sectionOf(
          h,
          'Checkbox group',
          [group.group({}, [], [h.span([], ['a, c']), group['group-input']({}, [], [])])],
          'Checkbox.groupParts(state, h, ui).group({}, [], [...])',
        ),
        sectionOf(
          h,
          'Toggle group and icon',
          [
            toggles.group(
              {},
              [],
              [icon.root({}, [h.AriaLabel('Bold')], [icon.icon({}, [], ['B'])])],
            ),
          ],
          'Toggle.groupParts(state, h, ui).group({}, [], [toggle.root(...)])',
        ),
      ]
    },
  },
  {
    id: 'field-set',
    title: 'Field Set',
    description: 'A fieldset with a legend. Disabling it disables every control inside.',
    render: ({ h, ui }) => {
      const set = Field.setParts(Field.setInit({ key: 'form-set' }), h, ui)
      const off = Field.setParts(Field.setInit({ key: 'form-set-off', disabled: true }), h, ui)
      const body = (p: typeof set): Html =>
        p.set(
          {},
          [],
          [
            p.legend({}, [], ['Notifications']),
            p.description({}, [], ['How we reach you.']),
            choice(h, h.input([h.Type('checkbox')]), 'Email'),
            choice(h, h.input([h.Type('checkbox')]), 'SMS'),
          ],
        )
      return [
        sectionOf(
          h,
          'Enabled and disabled',
          [body(set), body(off)],
          'p.set({}, [], [p.legend({}, [], [...]), ...])',
          stacked,
        ),
      ]
    },
  },
  {
    id: 'file-list',
    title: 'File List',
    description:
      'The list and items for the files a File Input holds. The Model keeps names and sizes.',
    render: ({ h, model, ui }) => {
      const f = FileInput.parts(model.ui.files, h, ui)
      const files = model.ui.files.files
      return [
        sectionOf(
          h,
          'Items',
          [
            f.list(
              {},
              [],
              files.length === 0
                ? [h.li([], ['Drop files on the File Drop page to see them here.'])]
                : files.map((file) =>
                    f.item({ value: file.name }, [], [`${file.name} (${file.size} bytes)`]),
                  ),
            ),
          ],
          'f.list({}, [], files.map(file => f.item({ value: file.name }, [], [file.name])))',
          stacked,
        ),
      ]
    },
  },
]
