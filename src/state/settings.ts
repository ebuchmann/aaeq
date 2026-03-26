import { atomWithStorage } from 'jotai/utils'

type SettingsAtom = {
  shortNames: boolean
  flagFilters: string[]
}

export const settingsAtom = atomWithStorage<SettingsAtom>('settings', {
  shortNames: false,
  flagFilters: [],
})
