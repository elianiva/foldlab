import { Option, pipe, Schema } from 'effect'
import { Route, Url } from 'foldkit'
import { literal, mapTo, oneOf, parseUrlWithFallback, root, slash, string } from 'foldkit/route'

export const AppRoute = Route.defineRouteUnion({
  Overview: {},
  Form: {},
  Component: { id: Schema.String },
  NotFound: { path: Schema.String },
})
export type AppRoute = typeof AppRoute.Type

export const overviewRouter = pipe(root, mapTo(AppRoute.Overview))
export const formRouter = pipe(literal('form'), mapTo(AppRoute.Form))
export const componentRouter = pipe(
  literal('components'),
  slash(string('id')),
  mapTo(AppRoute.Component),
)

export const urlToRoute = parseUrlWithFallback(
  oneOf(componentRouter, formRouter, overviewRouter),
  AppRoute.NotFound,
)

/** The URL a route lives at. The one place a path is written. */
export const pathOf = (route: AppRoute): string =>
  AppRoute.match<string>(route, {
    Overview: () => overviewRouter(),
    Form: () => formRouter(),
    Component: ({ id }) => componentRouter({ id }),
    NotFound: ({ path }) => path,
  })

/** A `Url` for a path, as the browser would hand it to `init`. Tests use it too. */
export const urlOf = (pathname: string): Url.Url => ({
  protocol: 'http:',
  host: 'localhost',
  port: Option.none(),
  pathname,
  search: Option.none(),
  hash: Option.none(),
})
