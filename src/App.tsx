import './App.css'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './components/ui/table'
import EquipmentData from '../Equipment_Data.json'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Search } from './components/Search'
import { filtersAtom } from './state/filters'
import { atom, useAtomValue } from 'jotai'
import { FilterStats } from './components/FilterStats'
import { FilterClasses } from './components/FilterClasses'
import { FilterWorn } from './components/FilterWorn'
import { Button } from './components/ui/button'
import { ArrowUpDown } from 'lucide-react'
import { paginationAtom } from './state/pagination'

type Stats = {
  damage?: string
  speed?: string
  damageTypes?: string[]
  wieldStrength?: number
  location?: string[]
  alignment?: string[]
  composition?: string[]
  weight?: number
  ac?: number
}

type EquipmentData = {
  name: string
  level: number
  stats: Stats
  classes: string[]
  worn: string[]
  flags: string[]
}

function formatObjectToString(obj: Record<string, any>): string {
  return Object.entries(obj)
    .map(([key, value]) => {
      if (typeof value === 'number') {
        const sign = value > 0 ? '+' : value < 0 ? '-' : ''
        return `${key} ${sign}${Math.abs(value)}`
      }
      return `${key} ${value}`
    })
    .join(', ')
}

const columnHelper = createColumnHelper<EquipmentData>()
const columns = [
  columnHelper.accessor('classes', {
    header: 'Class',
    filterFn: (row, columnId, value: string[]) => {
      if (value.length === 0) return true

      return value.every(
        (cls) => !!row.getValue<string[]>(columnId)?.includes(cls)
      )
    },
  }),
  columnHelper.accessor('worn', {
    header: 'Worn',
    cell: (info) => info.getValue()?.join(', '),
    filterFn: (row, columnId, value: string[]) => {
      if (value.length === 0) return true

      console.log(row.getValue(columnId))
      return value.every(
        (worn) => !!row.getValue<string[]>(columnId)?.includes(worn)
      )
    },
  }),
  columnHelper.accessor('name', {
    header: 'Name',
    filterFn: 'includesString',
  }),
  columnHelper.accessor('level', {
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Level
          <ArrowUpDown />
        </Button>
      )
    },
  }),
  columnHelper.accessor('flags', {
    header: 'Flags',
  }),
  columnHelper.accessor('stats', {
    id: 'stats',
    cell: (info) => formatObjectToString(info.getValue()),
    header: 'Stats',
    filterFn: (row, columnId, value: string[]) => {
      if (value.length === 0) return true

      return value.every(
        (stat) => !!row.getValue(columnId)?.hasOwnProperty(stat)
      )
    },
  }),
]

const columnFilterAtom = atom((get) => {
  return [
    { id: 'name', value: get(filtersAtom).search },
    { id: 'stats', value: get(filtersAtom).stats },
    { id: 'classes', value: get(filtersAtom).classes },
    { id: 'worn', value: get(filtersAtom).worn },
  ]
})

function App() {
  const columnFilters = useAtomValue(columnFilterAtom)
  const pagination = useAtomValue(paginationAtom)

  const tableInstance = useReactTable<EquipmentData>({
    data: EquipmentData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      columnFilters,
      pagination,
    },
  })

  const { getHeaderGroups, getRowModel } = tableInstance

  return (
    <>
      <Search />
      <FilterStats />
      <FilterClasses />
      <FilterWorn />
      <Table>
        <TableHeader>
          {getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}

export default App
