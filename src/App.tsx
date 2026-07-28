import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './components/ui/table'
import equipmentData from './data/equipment.json'
import {
  ColumnDef,
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
import { FilterWorn } from './components/FilterWorn'
import { Button } from './components/ui/button'
import { ArrowUpDown, ChevronDown, ChevronRight } from 'lucide-react'
import { paginationAtom } from './state/pagination'
import { Fragment, useCallback, useMemo } from 'react'
import { settingsAtom } from './state/settings'
import { FilterLevel } from './components/FilterLevel'
import { FilterAlignment } from './components/FilterAlignment'

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

export type EquipmentData = {
  damage?: {
    dice: number
    sides: number
  }
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

export const abbreviations: Record<string, string> = {
  CLER_CAST_LEVEL: 'CCL',
  DRUID_CAST_LEVEL: 'DCL',
  THIEF_SKILL_LEVEL: 'TSL',
  MAGE_CAST_LEVEL: 'MCL',
  NECR_CAST_LEVEL: 'NCL',
  WARR_SKILL_LEVEL: 'WSL',
  DAMROLL: 'DAM',
  HITROLL: 'HIT',
  MANA_REGEN: 'MAR',
  HP_REGEN: 'HPR',
  MOV_REGEN: 'MVR',
  CAST_ABILITY: 'CST',
  ATTACK_SPEED: 'ASPD',
  ALIGNMENT: 'ALGN',
  ABSORB_FIRE: 'AFIR',
  ABSORB_ICE: 'AICE',
  ABSORB_ZAP: 'AZAP',
  ABSORB_MAGIC: 'AMAG',
}

const shouldIncludeEquipment = (item: EquipmentData) => {
  return !item.worn?.some((value) => {
    const normalizedValue = value.replace(/_/g, '-').toUpperCase()
    return normalizedValue.includes('1-WIELD') || normalizedValue.includes('2-WIELD')
  })
}

const columnFilterAtom = atom((get) => {
  return [
    { id: 'name', value: get(filtersAtom).search },
    { id: 'stats', value: get(filtersAtom).stats },
    { id: 'worn', value: get(filtersAtom).worn },
    { id: 'flags', value: get(filtersAtom).flags },
  ]
})

export function useEquipmentColumns(options?: { includeWeaponColumns?: boolean }) {
  const filters = useAtomValue(filtersAtom).stats
  const settings = useAtomValue(settingsAtom)
  const columnHelper = useMemo(() => createColumnHelper<EquipmentData>(), [])

  const formatObjectToString = useCallback(
    (obj: Stats): string => {
      return Object.entries(obj)
        .sort(([keyA]) => {
          if (filters.includes(keyA)) return -1
          return 0
        })
        .map(([key, value]) => {
          const shortKey = settings.shortNames ? abbreviations[key] || key : key
          const isFiltered = filters.includes(key)
          const noGreenKeys = [
            abbreviations.CLER_CAST_LEVEL,
            abbreviations.DRUID_CAST_LEVEL,
            abbreviations.THIEF_SKILL_LEVEL,
            abbreviations.MAGE_CAST_LEVEL,
            abbreviations.NECR_CAST_LEVEL,
            abbreviations.WARR_SKILL_LEVEL,
          ]
          const color = isFiltered && !noGreenKeys.includes(shortKey) ? 'lime' : 'inherit'

          if (typeof value === 'number') {
            const sign = value > 0 ? '+' : value < 0 ? '-' : ''
            return `<span style="color: ${color}">${shortKey} ${sign}${Math.abs(value)}</span>`
          }
          return `<span style="color: ${color}">${shortKey} ${value}</span>`
        })
        .join(', ')
    },
    [filters, settings]
  )

  return useMemo<ColumnDef<EquipmentData, any>[]>(() => {
    const columns: ColumnDef<EquipmentData, any>[] = [
      columnHelper.display({
        id: 'expander',
        header: () => null,
        cell: ({ row }) => {
          if (!row.getCanExpand()) return null

          return (
            <Button
              variant="ghost"
              size="icon"
              onClick={row.getToggleExpandedHandler()}
              aria-label="Show drop location"
              aria-expanded={row.getIsExpanded()}
              title="Show drop location"
              className="h-8 w-8 p-0"
            >
              {row.getIsExpanded() ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          )
        },
      }),
      columnHelper.accessor('classes', {
        header: 'Class',
        cell: ({ getValue }) =>
          getValue()
            .map((cls: string) => cls[0])
            ?.join(', '),
        filterFn: (row, columnId, value: string[]) => {
          if (value.length === 0) return true

          return value.every((cls) => !!row.getValue<string[]>(columnId)?.includes(cls))
        },
      }),
      columnHelper.accessor('weight', {
        header: 'Wt',
        cell: ({ getValue }) => <div className="text-right">{getValue()}</div>,
      }),
      columnHelper.accessor('ac', {
        header: 'AC',
        cell: ({ getValue }) => <div className="text-right">{getValue() ?? '—'}</div>,
      }),
      columnHelper.accessor('worn', {
        header: 'Worn',
        cell: (info) => info.getValue()?.join(', '),
        filterFn: (row, columnId, value: string[]) => {
          if (value.length === 0) return true

          return value.some((worn) => !!row.getValue<string[]>(columnId)?.includes(worn))
        },
      }),
    ]

    if (options?.includeWeaponColumns) {
      columns.push(
        columnHelper.accessor('wieldStrength', {
          header: 'Wield Strength',
          cell: ({ getValue }) => <div className="text-right">{getValue()}</div>,
        }),
        columnHelper.accessor('damage', {
          header: 'Damage',
          cell: ({ getValue }) => {
            const damage = getValue<EquipmentData['damage']>()
            if (!damage) return '—'
            return `${damage.dice}d${damage.sides}`
          },
        }),
        columnHelper.accessor('speed', {
          header: 'Speed',
          cell: ({ getValue }) => getValue() || '—',
        })
      )
    }

    columns.push(
      columnHelper.accessor('name', {
        header: 'Name',
        filterFn: 'includesString',
      }),
      columnHelper.accessor('level', {
        header: ({ column }) => {
          return (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
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
        cell: ({ getValue }) => {
          const flags = getValue<string[]>() || []
          const filteredFlags = flags.filter((flag) => !settings.flagFilters?.includes(flag))
          return filteredFlags.join(', ')
        },
        filterFn: (row, columnId, value: string[]) => {
          if (value.length === 0) return true
          return value.every((alignment) => {
            const rowFlags = row.getValue<string[]>(columnId) || []

            if (alignment === 'GOOD') return !rowFlags.includes('ANTI_GOOD')
            if (alignment === 'NEUTRAL') return !rowFlags.includes('ANTI_NEUTRAL')
            if (alignment === 'EVIL') return !rowFlags.includes('ANTI_EVIL')
            return true
          })
        },
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

          return value.every((stat) => !!row.getValue(columnId)?.hasOwnProperty(stat))
        },
      })
    )

    return columns
  }, [columnHelper, formatObjectToString, options?.includeWeaponColumns, settings.flagFilters])
}

function App() {
  const columnFilters = useAtomValue(columnFilterAtom)
  const pagination = useAtomValue(paginationAtom)
  const filters = useAtomValue(filtersAtom)
  const columns = useEquipmentColumns()
  const visibleEquipmentData = useMemo(() => (equipmentData as EquipmentData[]).filter(shouldIncludeEquipment), [])

  const tableInstance = useReactTable<EquipmentData>({
    data: visibleEquipmentData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
    globalFilterFn: (row, _colName, filterValue) => {
      const { classLevel, totalLevel } = row.original
      let isValid = true

      if (filterValue.minClassLevel) isValid = isValid && classLevel >= filterValue.minClassLevel
      if (filterValue.maxClassLevel) isValid = isValid && classLevel <= filterValue.maxClassLevel
      if (filterValue.minTotalLevel) isValid = isValid && totalLevel >= filterValue.minTotalLevel
      if (filterValue.maxTotalLevel) isValid = isValid && totalLevel <= filterValue.maxTotalLevel

      return isValid
    },
    state: {
      columnFilters,
      pagination,
      globalFilter: filters,
    },
  })

  const { getHeaderGroups, getRowModel } = tableInstance

  return (
    <>
      <div className="flex-dir-col flex gap-4">
        <Search />
        <FilterStats />
        <FilterAlignment />
        <FilterWorn />
        <FilterLevel />
      </div>
      <Table>
        <TableHeader>
          {getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {getRowModel().rows.map((row) => (
            <Fragment key={row.id}>
              <TableRow>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
              {row.getIsExpanded() && (
                <TableRow>
                  <TableCell colSpan={row.getVisibleCells().length}>
                    <RenderSubComponent row={row} />
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

export function RenderSubComponent({ row }: { row: Row<EquipmentData> }) {
  const filters = useAtomValue(filtersAtom).stats
  const settings = useAtomValue(settingsAtom)

  const formatStatsForCopy = (stats: EquipmentData['stats']) => {
    return Object.entries(stats ?? {})
      .sort(([keyA]) => {
        if (filters.includes(keyA)) return -1
        return 0
      })
      .map(([key, value]) => {
        const shortKey = settings.shortNames ? abbreviations[key] || key : key

        if (typeof value === 'number') {
          const sign = value > 0 ? '+' : value < 0 ? '-' : ''
          return `${shortKey} ${sign}${Math.abs(value)}`
        }

        return `${shortKey} ${value}`
      })
      .join(', ')
  }

  const handleCopy = (source: string) => {
    const text = `${row.original.name} - ${source}`
    void navigator.clipboard.writeText(text)
  }

  const handleCopyAllDetails = () => {
    const statsText = formatStatsForCopy(row.original.stats) || 'None'
    const dropSources = row.original.dropSources?.length ? row.original.dropSources.join(', ') : 'Unknown'
    const detailParts = [
      `Name: ${row.original.name}`,
      ...(row.original.classLevel > 0 ? [`Class Level: ${row.original.classLevel}`] : []),
      ...(row.original.totalLevel > 0 ? [`Total Level: ${row.original.totalLevel}`] : []),
      `Stats: ${statsText}`,
      `Found: ${dropSources}`,
    ]
    const text = detailParts.join(', ')

    void navigator.clipboard.writeText(text)
  }

  return (
    <div className="flex flex-col gap-2 pl-4">
      {row.original.dropSources?.map((source) => (
        <div key={source} className="flex items-center gap-2">
          <span>{source}</span>
          <Button size="sm" onClick={() => handleCopy(source)}>
            Copy Drop Source
          </Button>
          <Button size="sm" onClick={handleCopyAllDetails}>
            Copy All Details
          </Button>
        </div>
      ))}
    </div>
  )
}

export default App
