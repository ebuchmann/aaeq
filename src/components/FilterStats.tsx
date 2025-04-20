import { useSetAtom } from 'jotai'
import { Checkbox } from './ui/checkbox'
import { filtersAtom } from '@/state/filters'

const stats = [
  'DAMROLL',
  'THIEF_SKILL_LEVEL',
  'CAST_ABILITY',
  'HITROLL',
  'ARMOR',
  'PARRY',
  'DODGE',
  'AGE',
  'MANA',
  'MANA_REGEN',
  'HP_REGEN',
  'MOV',
  'MOV_REGEN',
  'CLER_CAST_LEVEL',
  'DRUID_CAST_LEVEL',
  'MAGE_CAST_LEVEL',
  'NECR_CAST_LEVEL',
  'WARR_SKILL_LEVEL',
  'STR',
  'DEX',
  'CON',
  'WIS',
  'INT',
  'CHR',
  'LUCK',
  'ABSORB_FIRE',
  'ABSORB_ICE',
  'ABSORB_ZAP',
  'ABSORB_MAGIC',
]

export const FilterStats = () => {
  const setFilters = useSetAtom(filtersAtom)

  return (
    <>
      {stats.map((stat) => (
        <>
          <Checkbox
            key={stat}
            id={stat}
            onCheckedChange={(event) =>
              event
                ? setFilters((prev) => ({
                    ...prev,
                    stats: [...prev.stats, stat],
                  }))
                : setFilters((prev) => ({
                    ...prev,
                    stats: prev.stats.filter((s) => s !== stat),
                  }))
            }
          />
          <label htmlFor={stat}>{stat}</label>
        </>
      ))}
    </>
  )
}
