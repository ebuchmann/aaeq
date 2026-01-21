import { useAtomValue, useSetAtom } from 'jotai'
import { Checkbox } from './ui/checkbox'
import { filtersAtom } from '@/state/filters'
import { Popover } from '@radix-ui/react-popover'
import { PopoverContent, PopoverTrigger } from './ui/popover'
import { Label } from './ui/label'

const alignmentList = ['GOOD', 'NEUTRAL', 'EVIL']

export const FilterAlignment = () => {
  const setFilters = useSetAtom(filtersAtom)
  const { flags } = useAtomValue(filtersAtom)

  return (
    <Popover>
      <PopoverTrigger>Alignment</PopoverTrigger>
      <PopoverContent className="flex flex-col gap-2">
        {alignmentList.map((cls) => (
          <div className="flex items-center space-x-2" key={cls}>
            <Label htmlFor={cls}>
              <Checkbox
                id={cls}
                defaultChecked={flags.includes(cls)}
                onCheckedChange={(event) =>
                  event
                    ? setFilters((prev) => ({
                        ...prev,
                        flags: [...prev.flags, cls],
                      }))
                    : setFilters((prev) => ({
                        ...prev,
                        flags: prev.flags.filter((s) => s !== cls),
                      }))
                }
              />
              {cls}
            </Label>
          </div>
        ))}
      </PopoverContent>
    </Popover>
  )
}
