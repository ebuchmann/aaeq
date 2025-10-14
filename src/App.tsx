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
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
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
import { Fragment } from 'react/jsx-runtime'

type Stats = {
  INT?: number
  STR?: number
  DEX?: number
  CON?: number
  WIS?: number
  CHR?: number
  LUCK?: number
  ARMOR?: number
  HITROLL?: number
  DAMROLL?: number
  AGE?: number
  MANA?: number
  MANA_REGEN?: number
  HP_REGEN?: number
  MOVE?: number
  MOV_REGEN?: number
  CLER_CAST_LEVEL?: number
  DRUID_CAST_LEVEL?: number
  THIEF_SKILL_LEVEL?: number
  MAGE_CAST_LEVEL?: number
  NECR_CAST_LEVEL?: number
  WARR_SKILL_LEVEL?: number
  ABSORB_FIRE?: number
  ABSORB_ICE?: number
  ABSORB_ZAP?: number
  ABSORB_MAGIC?: number
  CAST_ABILITY?: number
  PARRY?: number
  DODGE?: number
}

type EquipmentData = {
  damage?: string
  speed?: string
  wieldStrength?: number
  location?: string[]
  composition?: string[]
  ac?: number
  damageTypes?: string[]
  alignment?: string[]
  name: string
  classLevel: number
  totalLevel: number
  level: number
  stats: Stats
  classes: string[]
  worn: string[]
  flags: string[]
  weight: number
  dropSources?: string[]
}

const abbreviations: Record<string, string> = {
  CLER_CAST_LEVEL: 'CCL',
  DRUID_CAST_LEVEL: 'DCL',
  THIEF_SKILL_LEVEL: 'TSL',
  MAGE_CAST_LEVEL: 'MCL',
  NECR_CAST_LEVEL: 'NCL',
  WARR_SKILL_LEVEL: 'WSL',
  DAMROLL: 'DAM',
  HITROLL: 'HIT',
  MANA_REGEN: 'MRG',
  HP_REGEN: 'HRG',
  MOV_REGEN: 'MVR',
  CAST_ABILITY: 'CST',
  ATTACK_SPEED: 'ASPD',
}
function formatObjectToString(obj: Stats): string {
  const filters = useAtomValue(filtersAtom).stats

  return Object.entries(obj)
    .sort(([keyA]) => {
      if (filters.includes(keyA)) return -1
      return 0
    })
    .map(([key, value]) => {
      const shortKey = abbreviations[key] || key
      const isFiltered = filters.includes(key)
      const noGreenKeys = [
        abbreviations.CLER_CAST_LEVEL,
        abbreviations.DRUID_CAST_LEVEL,
        abbreviations.THIEF_SKILL_LEVEL,
        abbreviations.MAGE_CAST_LEVEL,
        abbreviations.NECR_CAST_LEVEL,
        abbreviations.WARR_SKILL_LEVEL,
      ]
      const color =
        isFiltered && !noGreenKeys.includes(shortKey) ? 'lime' : 'inherit'

      if (typeof value === 'number') {
        const sign = value > 0 ? '+' : value < 0 ? '-' : ''
        return `<span style="color: ${color}">${shortKey} ${sign}${Math.abs(value)}</span>`
      }
      return `<span style="color: ${color}">${shortKey} ${value}</span>`
    })
    .join(', ')
}

const columnHelper = createColumnHelper<EquipmentData>()
const columns = [
  columnHelper.accessor('classes', {
    header: 'Class',
    cell: ({ getValue }) =>
      getValue()
        .map((cls) => cls[0])
        ?.join(', '),
    filterFn: (row, columnId, value: string[]) => {
      if (value.length === 0) return true

      return value.every(
        (cls) => !!row.getValue<string[]>(columnId)?.includes(cls)
      )
    },
  }),
  columnHelper.accessor('weight', {
    header: 'Wt',
    cell: ({ getValue }) => <div className="text-right">{getValue()}</div>,
  }),
  columnHelper.accessor('worn', {
    header: 'Worn',
    cell: (info) => info.getValue()?.join(', '),
    filterFn: (row, columnId, value: string[]) => {
      if (value.length === 0) return true

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
          Lv
          <ArrowUpDown />
        </Button>
      )
    },
    cell: ({ row }) => (
      <pre className="text-right">
        {String(row.original.classLevel).padStart(2, ' ')}
        {String(row.original.totalLevel).padStart(5, ' ')}
      </pre>
    ),
  }),
  columnHelper.accessor('flags', {
    header: 'Flags',
  }),
  columnHelper.accessor('stats', {
    id: 'stats',
    cell: (info) => (
      <div
        dangerouslySetInnerHTML={{
          __html: formatObjectToString(info.getValue()),
        }}
      />
    ),
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
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
    state: {
      columnFilters,
      pagination,
    },
  })

  const { getHeaderGroups, getRowModel } = tableInstance

  return (
    <>
      {/* <CommandMenu /> */}
      <Search />
      <div className="flex-dir-col flex gap-2">
        <div>
          <FilterStats />
        </div>
        <div>
          <FilterClasses />
        </div>
        <div>
          <FilterWorn />
        </div>
      </div>
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
            <Fragment key={row.id}>
              <TableRow
                className="cursor-pointer"
                onClick={row.getToggleExpandedHandler()}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
              {row.getIsExpanded() && (
                <TableRow>
                  {/* 2nd row is a custom 1 cell row */}
                  <TableCell colSpan={row.getVisibleCells().length}>
                    {renderSubComponent({ row })}
                  </TableCell>
                </TableRow>
              )}
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </>
  )
}

const renderSubComponent = ({ row }: { row: Row<EquipmentData> }) => {
  return (
    <div className="flex flex-col gap-2 pl-4">
      {row.original.dropSources?.map((source) => (
        <div key={source}>
          {source}
          <br />
        </div>
      ))}
    </div>
  )
}

export default App
