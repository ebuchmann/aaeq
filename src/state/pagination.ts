import { atom } from 'jotai'

type PaginationAtom = {
  pageIndex: number
  pageSize: number
}

export const paginationAtom = atom<PaginationAtom>({
  pageIndex: 0,
  pageSize: 100,
})
