import { atom } from 'jotai'

type FilterAtoms = {
  search: string
  stats: string[]
  worn: string[]
  classes: string[]
  minClassLevel: number
  maxClassLevel: number
  minTotalLevel: number
  maxTotalLevel: number
}

export const filtersAtom = atom<FilterAtoms>({
  search: '',
  stats: [],
  worn: [],
  classes: [],
  minClassLevel: 0,
  maxClassLevel: 0,
  minTotalLevel: 0,
  maxTotalLevel: 0,
})
