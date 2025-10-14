import { Command } from 'cmdk'
import { useState } from 'react'

export const CommandMenu = () => {
  const [search, setSearch] = useState('')
  const [page, setPages] = useState('')

  return (
    <Command
      onKeyDown={(e) => {
        // Escape goes to previous page
        // Backspace goes to previous page when search is empty
        if (e.key === 'Escape' || (e.key === 'Backspace' && !search)) {
          e.preventDefault()
          setPages((pages) => pages.slice(0, -1))
        }
      }}
    >
      <Command.Input
        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
        value={search}
        placeholder="Filter by..."
        onValueChange={setSearch}
      />
      <Command.List>
        {!page && (
          <>
            <Command.Item value="class" onSelect={setPages}>
              Class
            </Command.Item>
            <Command.Item value="stat" onSelect={setPages}>
              Stat
            </Command.Item>
          </>
        )}

        {page === 'class' && (
          <>
            <Command.Item>Project A</Command.Item>
            <Command.Item>Project B</Command.Item>
          </>
        )}

        {page === 'stat' && (
          <>
            <Command.Item>Team 1</Command.Item>
            <Command.Item>Team 2</Command.Item>
          </>
        )}
      </Command.List>
    </Command>
  )
}
