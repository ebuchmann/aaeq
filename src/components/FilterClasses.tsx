import { useSetAtom } from 'jotai'
import { Checkbox } from './ui/checkbox'
import { filtersAtom } from '@/state/filters'

const classes = ['MAGE', 'CLERIC', 'THIEF', 'WARRIOR', 'DRUID', 'NECR']

export const FilterClasses = () => {
  const setFilters = useSetAtom(filtersAtom)

  return (
    <>
      {classes.map((cls) => (
        <>
          <Checkbox
            key={cls}
            id={cls}
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
          <label htmlFor={cls}>{cls}</label>
        </>
      ))}
    </>
  )
}
