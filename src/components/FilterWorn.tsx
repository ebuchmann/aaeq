import { useSetAtom } from 'jotai'
import { Checkbox } from './ui/checkbox'
import { filtersAtom } from '@/state/filters'

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
  '1_WIELD',
  '2_WIELD',
]

export const FilterWorn = () => {
  const setFilters = useSetAtom(filtersAtom)

  return (
    <>
      {wornSpots.map((worn) => (
        <>
          <Checkbox
            key={worn}
            id={worn}
            onCheckedChange={(event) =>
              event
                ? setFilters((prev) => ({
                    ...prev,
                    worn: [...prev.worn, worn],
                  }))
                : setFilters((prev) => ({
                    ...prev,
                    worn: prev.worn.filter((s) => s !== worn),
                  }))
            }
          />
          <label htmlFor={worn}>{worn}</label>
        </>
      ))}
    </>
  )
}
