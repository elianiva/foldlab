// The forms family's ui state: kit entries and their initial values. `main.ts` spreads both.
import {
  Checkbox,
  DateInput,
  Input,
  NumberInput,
  PasswordInput,
  Radio,
  Rating,
  Slider,
  Switch,
  Textarea,
  TimeInput,
  TokenInput,
} from '@foldlab/adapter'

export const formsKit = {
  formName: Input.component,
  formNotes: Textarea.component,
  formPassword: PasswordInput.component,
  formQuantity: NumberInput.component,
  formTime: TimeInput.component,
  formDate: DateInput.component,
  formTags: TokenInput.component,
  formRating: Rating.component,
  formRatingHalf: Rating.component,
  formCheck: Checkbox.component,
  formSwitch: Switch.component,
  formPlan: Radio.component,
  formSlider: Slider.component,
}

export const formsInit = {
  formName: Input.init({ key: 'form-name', value: 'Ada' }),
  formNotes: Textarea.init({ key: 'form-notes' }),
  formPassword: PasswordInput.init({ key: 'form-password', value: 'hunter2' }),
  formQuantity: NumberInput.init({ key: 'form-quantity', value: 2, min: 0, max: 10 }),
  formTime: TimeInput.init({ key: 'form-time', value: '09:30' }),
  formDate: DateInput.init({ key: 'form-date', value: '2026-11-17' }),
  formTags: TokenInput.init({
    key: 'form-tags',
    value: ['Hello ', { type: 'mention', value: 'ada', label: '@ada' }, ' there'],
  }),
  formRating: Rating.init({ key: 'form-rating', value: 3, name: 'rating' }),
  formRatingHalf: Rating.init({ key: 'form-rating-half', value: 2.5, step: 0.5 }),
  formCheck: Checkbox.init({ key: 'form-check', checked: true, name: 'news' }),
  formSwitch: Switch.init({ key: 'form-switch', name: 'dark' }),
  formPlan: Radio.init({ key: 'form-plan', value: 'pro', name: 'plan' }),
  formSlider: Slider.init({ key: 'form-slider', value: [30], name: 'volume' }),
}
