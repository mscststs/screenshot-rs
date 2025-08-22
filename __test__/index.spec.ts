import test from 'ava'

import { listScreens } from "../";

test('can get screens', (t) => {
  const screens = listScreens()
  t.is(screens.length >= 0, true)
})
