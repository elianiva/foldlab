import { expect, test } from 'vitest'
import { AppRoute, pathOf, urlOf, urlToRoute } from './route.ts'

test('every route prints to a path that parses back to it', () => {
  const routes = [AppRoute.Overview(), AppRoute.Form(), AppRoute.Component({ id: 'dialog' })]
  for (const route of routes) expect(urlToRoute(urlOf(pathOf(route)))).toEqual(route)
})

test('component ids come from the path, and anything else is not found', () => {
  expect(urlToRoute(urlOf('/components/date-picker'))).toEqual(
    AppRoute.Component({ id: 'date-picker' }),
  )
  expect(urlToRoute(urlOf('/nope'))).toEqual(AppRoute.NotFound({ path: '/nope' }))
  expect(urlToRoute(urlOf('/components'))).toEqual(AppRoute.NotFound({ path: '/components' }))
})
