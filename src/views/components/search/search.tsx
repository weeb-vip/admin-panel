import {useState} from "react";
import useDebounce from "../../../components/Search/useDebounce";
import {useQuery} from "@tanstack/react-query";
import {Combobox, ComboboxInput, ComboboxOptions} from "@headlessui/react";

function Search<T>({searchFunction, mapFunction, selectFunction}: { selectFunction: any, searchFunction: any, mapFunction: any}) {
  const [query, setQuery] = useState<string>('')
  const debouncedSearch = useDebounce(query, 300);
  const {
    data,
    isLoading: isLoading,
  } = useQuery<T>({
    ...searchFunction(query),
    enabled: Boolean(query)
  })
  const [selected, setSelected] = useState<string>('')

  const onSelected = (value: string) => {
    setSelected(value)
    selectFunction(value)
  }

  return (
    <div className={"flex flex-col w-full"}>
        <Combobox value={selected} onChange={onSelected}>
          <ComboboxInput
            aria-label="Assignee"
            className="rounded-full w-64 py-2 px-3 pl-10 text-sm leading-5 text-gray-900 outline-none border border-gray-200 focus:border-gray-400 active:border-gray-400"
            displayValue={(value) => value?.title}
            onChange={(event) => setQuery(event.target.value)}
          />
          <ComboboxOptions anchor="bottom" className="border empty:invisible">
            {mapFunction(data)}
          </ComboboxOptions>
        </Combobox>
      </div>

  );
}

export default Search;