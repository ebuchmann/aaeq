import { useAtomValue, useSetAtom } from 'jotai'
import { filtersAtom } from '@/state/filters'
import { Popover } from '@radix-ui/react-popover'
import { PopoverContent, PopoverTrigger } from './ui/popover'
import { Input } from './ui/input'
import { Label } from './ui/label'

export const FilterLevel = () => {
  const setFilters = useSetAtom(filtersAtom)
  const { minClassLevel, maxClassLevel, minTotalLevel, maxTotalLevel } = useAtomValue(filtersAtom)

  return (
    <Popover>
      <PopoverTrigger>Level</PopoverTrigger>
      <PopoverContent className="flex flex-col gap-2">
        <Label>
          Min Class Level
          <Input
            type="number"
            placeholder="Min Class Level"
            value={minClassLevel === 0 ? '' : minClassLevel}
            onChange={(e) => setFilters((prev) => ({ ...prev, minClassLevel: Number(e.target.value) }))}
          />
        </Label>
        <Label>
          Max Class Level
          <Input
            type="number"
            placeholder="Max Class Level"
            value={maxClassLevel === 0 ? '' : maxClassLevel}
            onChange={(e) => setFilters((prev) => ({ ...prev, maxClassLevel: Number(e.target.value) }))}
          />
        </Label>
        <Label>
          Min Total Level
          <Input
            type="number"
            placeholder="Min Total Level"
            value={minTotalLevel === 0 ? '' : minTotalLevel}
            onChange={(e) => setFilters((prev) => ({ ...prev, minTotalLevel: Number(e.target.value) }))}
          />
        </Label>
        <Label>
          Max Total Level
          <Input
            type="number"
            placeholder="Max Total Level"
            value={maxTotalLevel === 0 ? '' : maxTotalLevel}
            onChange={(e) => setFilters((prev) => ({ ...prev, maxTotalLevel: Number(e.target.value) }))}
          />
        </Label>
      </PopoverContent>
    </Popover>
  )
}
