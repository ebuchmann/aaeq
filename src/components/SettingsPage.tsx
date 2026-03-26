import { settingsAtom } from '@/state/settings'
import { useAtomValue, useSetAtom } from 'jotai'
import { Checkbox } from './ui/checkbox'
import { Label } from './ui/label'

export const SettingsPage = () => {
  const setSettings = useSetAtom(settingsAtom)
  const settings = useAtomValue(settingsAtom)

  const flagList = ['RARE', 'GLOW', 'ARTIFACT', 'LIGHT', 'FLOATING', 'TRANSPARENT', 'HUM', 'RELIC']

  return (
    <div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="shortnames"
          checked={settings.shortNames}
          onCheckedChange={(event) =>
            setSettings((prev) => ({
              ...prev,
              shortNames: event ? true : false,
            }))
          }
        />
        <Label htmlFor="shortnames">Use Stat Shortnames</Label>
      </div>
      <div className="mt-4">
        <h3 className="mb-2 text-lg font-semibold">Flag Filters</h3>
        {flagList.map((flag) => (
          <div key={flag} className="flex items-center space-x-2">
            <Checkbox
              id={flag}
              checked={settings.flagFilters?.includes(flag) || false}
              onCheckedChange={(event) =>
                event
                  ? setSettings((prev) => ({
                      ...prev,
                      flagFilters: [...(prev.flagFilters || []), flag],
                    }))
                  : setSettings((prev) => ({
                      ...prev,
                      flagFilters: (prev.flagFilters || []).filter((f) => f !== flag),
                    }))
              }
            />
            <Label htmlFor={flag}>{flag}</Label>
          </div>
        ))}
      </div>
    </div>
  )
}
