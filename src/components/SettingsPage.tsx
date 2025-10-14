import { settingsAtom } from '@/state/settings'
import { useAtomValue, useSetAtom } from 'jotai'
import { Checkbox } from './ui/checkbox'
import { Label } from './ui/label'

export const SettingsPage = () => {
  const setSettings = useSetAtom(settingsAtom)
  const settings = useAtomValue(settingsAtom)

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
    </div>
  )
}
