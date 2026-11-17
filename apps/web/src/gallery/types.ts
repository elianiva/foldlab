import type { Html, HtmlBuilder } from 'foldkit/html'
import type { PartsConfig } from '@foldlab/ui'
import type { Message, Model } from '../app/main.ts'

/** What a page needs to render: the builder, the Model, and the ui parts config. */
export type Ctx = Readonly<{ h: HtmlBuilder<Message>; model: Model; ui: PartsConfig<Message> }>

export type Page = Readonly<{
  id: string
  title: string
  description: string
  /** Sections for the page, built from the context. */
  render: (c: Ctx) => ReadonlyArray<Html>
}>
