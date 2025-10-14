import { useAtomValue, useSetAtom } from 'jotai'
import { Checkbox } from './ui/checkbox'
import { filtersAtom } from '@/state/filters'
import { Popover } from '@radix-ui/react-popover'
import { PopoverContent, PopoverTrigger } from './ui/popover'
import { Label } from './ui/label'

const classList = ['MAGE', 'CLERIC', 'THIEF', 'WARRIOR', 'DRUID', 'NECR']

export const FilterClasses = () => {
  const setFilters = useSetAtom(filtersAtom)
  const { classes } = useAtomValue(filtersAtom)

  return (
    <Popover>
      <PopoverTrigger>Classes</PopoverTrigger>
      <PopoverContent className="flex flex-col gap-2">
        {classList.map((cls) => (
          <div className="flex items-center space-x-2" key={cls}>
            <Checkbox
              id={cls}
              defaultChecked={classes.includes(cls)}
              onCheckedChange={(event) =>
                event
                  ? setFilters((prev) => ({
                      ...prev,
                      classes: [...prev.classes, cls],
                    }))
                  : setFilters((prev) => ({
                      ...prev,
                      classes: prev.classes.filter((s) => s !== cls),
                    }))
              }
            />
            <Label htmlFor={cls}>{cls}</Label>
          </div>
        ))}
      </PopoverContent>
    </Popover>
  )
}
