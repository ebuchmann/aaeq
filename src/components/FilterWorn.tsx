import { useAtomValue, useSetAtom } from 'jotai'
import { Checkbox } from './ui/checkbox'
import { filtersAtom } from '@/state/filters'
import { Popover, PopoverContent } from './ui/popover'
import { PopoverTrigger } from '@radix-ui/react-popover'
import { Label } from './ui/label'

const wornSpots = [
  'HEAD',
  'NECK',
  'ARMS',
  'WRISTS',
  'HANDS',
  'FINGERS',
  'ON_BODY',
  'ABOUT_BODY',
  'WAIST',
  'LEGS',
  'FEET',
  'HELD',
  'SHIELD',
  '1-WIELD',
  '2-WIELD',
]

export const FilterWorn = () => {
  const setFilters = useSetAtom(filtersAtom)
  const { worn } = useAtomValue(filtersAtom)

  return (
    <Popover>
      <PopoverTrigger>Worn</PopoverTrigger>
      <PopoverContent className="flex flex-col gap-2">
        {wornSpots.map((spot) => (
          <div className="flex items-center space-x-2" key={spot}>
            <Label htmlFor={spot}>
              <Checkbox
                key={spot}
                id={spot}
                defaultChecked={worn.includes(spot)}
                onCheckedChange={(event) =>
                  event
                    ? setFilters((prev) => ({
                        ...prev,
                        worn: [...prev.worn, spot],
                      }))
                    : setFilters((prev) => ({
                        ...prev,
                        worn: prev.worn.filter((s) => s !== spot),
                      }))
                }
              />
              {spot}
            </Label>
          </div>
        ))}
      </PopoverContent>
    </Popover>
  )
}
