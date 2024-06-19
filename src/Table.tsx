import { useEffect, useState } from "react";
import { StatusPayload } from "./types/StatusPayload";

function TH({
  children,
  active,
  sortDirection,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  sortDirection: "asc" | "desc";
  onClick: () => void;
}) {
  let suffix = null;
  if (active) {
    if (sortDirection === "asc") {
      suffix = "🔼";
    } else {
      suffix = "🔽";
    }
  }
  return (
    <th
      scope="col"
      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
      onClick={onClick}
    >
      {children}
      {suffix}
    </th>
  );
}

export function Table({ iras }: { iras: Map<string, StatusPayload> }) {
  // const filter = (event: React.ChangeEvent<HTMLInputElement>) => {};
  // const sort = (value: keyof Data[0], order: string) => {};
  // const sortOn = (value: keyof StatusPayload) => {};
  const [sortOn, setSortOn] = useState<keyof StatusPayload>("id");
  const [checkedIras, setCheckedIras] = useState(new Set<string>());
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [irasList, setIrasList] = useState<StatusPayload[]>([]);
  const [lastSelectedId, setLastSelectedId] = useState<string>("");

  function updateSortOn(value: keyof StatusPayload) {
    if (value === sortOn) {
      // reverse the sort direction
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortOn(value);
      setSortDirection("asc");
    }
  }

  function toggleChecked(id: string, shiftKey: boolean = false) {
    if (checkedIras.has(id)) {
      checkedIras.delete(id);
    } else {
      checkedIras.add(id);
      // go through the irasList and check all the iras between the last selected and this one
      if (shiftKey) {
        const ids = irasList.map((ira) => ira.id);
        const lastSelectedIndex = ids.indexOf(lastSelectedId);
        const thisIndex = ids.indexOf(id);
        const start = Math.min(lastSelectedIndex, thisIndex);
        const end = Math.max(lastSelectedIndex, thisIndex);
        for (let i = start; i <= end; i++) {
          checkedIras.add(ids[i]);
        }
      }

      setLastSelectedId(id);
    }
    setCheckedIras(new Set(checkedIras));
  }

  useEffect(() => {
    const irasArray = Array.from(iras.values()) as StatusPayload[];
    irasArray.sort((a, b) => {
      if (a[sortOn] > b[sortOn]) {
        return 1;
      }
      if (a[sortOn] < b[sortOn]) {
        return -1;
      }
      return 0;
    });
    if (sortDirection === "desc") {
      irasArray.reverse();
    }
    setIrasList(irasArray);
  }, [iras, sortOn, sortDirection]);

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="">
        {/* <input
          type="text"
          placeholder="Search..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          onChange={filter}
        /> */}
        <input
          type="text"
          placeholder="Command"
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>{}</div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                    <span className="sr-only">Select</span>
                  </th>
                  <TH
                    active={sortOn === "id"}
                    sortDirection={sortDirection}
                    onClick={() => updateSortOn("id")}
                  >
                    ID
                  </TH>
                  <TH
                    active={sortOn === "name"}
                    sortDirection={sortDirection}
                    onClick={() => updateSortOn("name")}
                  >
                    Name
                  </TH>
                  <TH
                    active={sortOn === "handlers"}
                    sortDirection={sortDirection}
                    onClick={() => updateSortOn("handlers")}
                  >
                    Handlers
                  </TH>
                  <TH
                    active={sortOn === "mem_free"}
                    sortDirection={sortDirection}
                    onClick={() => updateSortOn("mem_free")}
                  >
                    Mem free
                  </TH>
                  <TH
                    active={sortOn === "hardware"}
                    sortDirection={sortDirection}
                    onClick={() => updateSortOn("hardware")}
                  >
                    Hardware
                  </TH>
                  <TH
                    active={sortOn === "version"}
                    sortDirection={sortDirection}
                    onClick={() => updateSortOn("version")}
                  >
                    Version
                  </TH>
                  <TH
                    active={sortOn === "mem_alloc"}
                    sortDirection={sortDirection}
                    onClick={() => updateSortOn("mem_alloc")}
                  >
                    Mem alloc
                  </TH>
                  <TH
                    active={sortOn === "timestamp"}
                    sortDirection={sortDirection}
                    onClick={() => updateSortOn("timestamp")}
                  >
                    Last seen
                  </TH>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {irasList.map((ira) => (
                  <tr
                    key={ira.id}
                    className="hover:bg-gray-200"
                    onClick={(e) => toggleChecked(ira.id, e.shiftKey)}
                  >
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                      <a
                        href="#"
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <input
                          type="checkbox"
                          disabled={true}
                          checked={checkedIras.has(ira.id)}
                        />
                      </a>
                    </td>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                      {ira.id}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {ira.name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {ira.handlers.join(", ")}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {ira.mem_free}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {ira.hardware}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {ira.version}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {ira.mem_alloc}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {ira.timestamp.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
