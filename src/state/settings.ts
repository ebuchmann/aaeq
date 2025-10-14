import { atomWithStorage } from 'jotai/utils'

type SettingsAtom = {
  shortNames: boolean
}

export const settingsAtom = atomWithStorage<SettingsAtom>('settings', {
  shortNames: false,
})
