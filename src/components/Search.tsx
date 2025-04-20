import { useEffect, useState } from "react"
import { Input } from "./ui/input"
import { useDebounce } from "@uidotdev/usehooks";
import { filtersAtom } from "@/state/filters";
import { useSetAtom } from "jotai";

export const Search = () => {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300);
  const setFilters = useSetAtom(filtersAtom)

  useEffect(() => {
    // Update the filter state with the debounced search value
    setFilters((prev) => ({ ...prev, search: debouncedSearch }));
  }, [debouncedSearch]);

  return (
    <Input type='text' placeholder='Search' value={search} onChange={(event) => setSearch(event.target.value)} />
  )
}