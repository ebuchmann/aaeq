import { atom } from 'jotai'

type FilterAtoms = {
  search: string
  stats: string[]
  worn: string[]
  classes: string[]
}

export const filtersAtom = atom<FilterAtoms>({
  search: '',
  stats: [],
  worn: [],
  classes: [],
})
