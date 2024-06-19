import { useEffect, useState } from "react";
import { StatusPayload } from "./types/StatusPayload";
// ChevronDown Heroicons
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import { useIras } from "./hooks/useNats";

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
      suffix = <ChevronUpIcon className="w-4 h-4" />;
    } else {
      suffix = <ChevronDownIcon className="w-4 h-4" />;
    }
  }
  return (
    <th
      scope="col"
      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
      onClick={onClick}
    >
      <div className="inline-flex">
        {children}
        {suffix}
      </div>
    </th>
  );
}

function LastSeen({ timestamp }: { timestamp: Date }) {
  // return a color based on how long ago the timestamp was
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const minutes = diff / 1000 / 60;
  let color = "bg-gray-500";
  if (minutes < 5) {
    color = "bg-green-500";
  } else if (minutes < 10) {
    color = "bg-yellow-500";
  } else if (minutes < 15) {
    color = "bg-red-500";
  }
  return <div className={`w-4 h-4 rounded ${color}`} />;
}

export function Table() {
  const rootTopic = "area3001.ira";
  const iraTopic = `${rootTopic}.>`;

  const storedConnectionString =
    localStorage.getItem("connectionString") || "ws://localhost:8443";

  const [connectionString, setConnectionString] = useState<string>(
    storedConnectionString
  );
  const { iras, sendCommand, connected, error } = useIras(
    connectionString,
    iraTopic
  );

  const [topicSuffix, setTopicSuffix] = useState<string>("");
  const [command, setCommand] = useState<string>("");
  const [sortOn, setSortOn] = useState<keyof StatusPayload>("id");
  const [selectedIras, setCheckedIras] = useState(new Set<string>());
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
    if (selectedIras.has(id)) {
      selectedIras.delete(id);
    } else {
      selectedIras.add(id);
      // go through the irasList and check all the iras between the last selected and this one
      if (shiftKey) {
        const ids = irasList.map((ira) => ira.id);
        const lastSelectedIndex = ids.indexOf(lastSelectedId);
        const thisIndex = ids.indexOf(id);
        const start = Math.min(lastSelectedIndex, thisIndex);
        const end = Math.max(lastSelectedIndex, thisIndex);
        for (let i = start; i <= end; i++) {
          selectedIras.add(ids[i]);
        }
      }

      setLastSelectedId(id);
    }
    setCheckedIras(new Set(selectedIras));
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

  async function submitCommand(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const topics = Array.from(selectedIras).map((id) => {
      // get ira by id
      const ira = iras.get(id);
      if (!ira) {
        console.error("IRA not found", id);
        return "";
      }
      const topic = `${rootTopic}.${ira.group}.devices.${ira.id}`;
      if (topicSuffix === "") {
        return topic;
      }
      return `${topic}.${topicSuffix}`;
    });
    console.log("send command", topics);
    for (const topic of topics) {
      sendCommand(topic, command);
    }
  }

  if (error) {
    return <div className="bg-red-200">Error: {error.message}</div>;
  }

  return (
    <div className="px-4 py-2 sm:px-6 lg:px-8">
      <div className="flex justify-center items-center gap-4">
        <label htmlFor="connection-string" className="whitespace-nowrap">
          Connection string
        </label>
        <input
          id="connection-string"
          type="text"
          value={connectionString}
          onChange={(e) => {
            setConnectionString(e.target.value);
            localStorage.setItem("connectionString", e.target.value);
          }}
          placeholder="Connection string"
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
        <div
          className={clsx(
            "w-8 h-8 rounded border shadow shrink-0",
            connected ? "bg-green-500" : "bg-red-500"
          )}
        />
      </div>
      <form
        className="flex justify-center items-center gap-4 mt-4"
        onSubmit={submitCommand}
      >
        {/* <input
          type="text"
          placeholder="Search..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          onChange={filter}
        /> */}
        <input
          type="text"
          value={topicSuffix}
          onChange={(e) => setTopicSuffix(e.target.value)}
          placeholder="Topic Suffix"
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="Command"
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
        <input
          type="submit"
          value="Send"
          className="hover:bg-blue-600 px-4 py-2 disabled:bg-gray-300 bg-blue-500 text-white rounded-md shadow-sm sm:text-sm"
          disabled={selectedIras.size === 0 || command === ""}
        />
      </form>
      <div className="mt-4">
        Example topic:{" "}
        {`${rootTopic}.GROUP.devices.DEVICE_ID${
          topicSuffix !== "" ? "." : ""
        }${topicSuffix}`}
        ;
      </div>
      <div className="mt-4">
        Selected: {selectedIras.size === 0 && "None"}{" "}
        {Array.from(selectedIras).join(", ")}
      </div>

      <div className="mt-4 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                    <span className="sr-only">Select</span>
                  </th>
                  <TH
                    active={sortOn === "timestamp"}
                    sortDirection={sortDirection}
                    onClick={() => updateSortOn("timestamp")}
                  >
                    Last seen
                  </TH>
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
                    active={sortOn === "handlers"}
                    sortDirection={sortDirection}
                    onClick={() => updateSortOn("handlers")}
                  >
                    Handlers
                  </TH>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {irasList.map((ira) => (
                  <tr
                    key={ira.id}
                    className={clsx(
                      "hover:bg-gray-200",
                      selectedIras.has(ira.id) && "bg-gray-100"
                    )}
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
                          checked={selectedIras.has(ira.id)}
                        />
                      </a>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <LastSeen timestamp={ira.timestamp} />
                    </td>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                      {ira.id}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {ira.name}
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
                      {ira.handlers.join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {irasList.length === 0 && <div>No IRAs found</div>}
            {irasList.length > 0 && <div>Found: {irasList.length} IRAs</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
