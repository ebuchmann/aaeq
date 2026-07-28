import { createFileRoute } from '@tanstack/react-router'
import { atom, useAtomValue } from 'jotai'
import { Fragment, useMemo } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import equipmentData from '@/data/equipment.json'
import { Search } from '@/components/Search'
import { FilterStats } from '@/components/FilterStats'
import { FilterAlignment } from '@/components/FilterAlignment'
import { FilterWorn } from '@/components/FilterWorn'
import { FilterLevel } from '@/components/FilterLevel'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { filtersAtom } from '@/state/filters'
import { paginationAtom } from '@/state/pagination'
import { RenderSubComponent, useEquipmentColumns, type EquipmentData } from '@/App'

const weaponWornTypes = ['1-WIELD', '2_WIELD']

const columnFilterAtom = atom((get) => {
  const filters = get(filtersAtom)
  return [
    { id: 'name', value: filters.search },
    { id: 'stats', value: filters.stats },
    { id: 'worn', value: filters.worn },
    { id: 'flags', value: filters.flags },
  ]
})

export const Route = createFileRoute('/weapons')({
  component: RouteComponent,
})

function RouteComponent() {
  const columnFilters = useAtomValue(columnFilterAtom)
  const pagination = useAtomValue(paginationAtom)
  const filters = useAtomValue(filtersAtom)
  const columns = useEquipmentColumns({ includeWeaponColumns: true })

  const weaponRows = useMemo(
    () =>
      (equipmentData as EquipmentData[]).filter((item) => item.worn?.some((value) => weaponWornTypes.includes(value))),
    []
  )

  const tableInstance = useReactTable<EquipmentData>({
    data: weaponRows,
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
    <div className="space-y-4">
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
    </div>
  )
}
