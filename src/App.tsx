import { Table } from "./Table";
import { useIras } from "./hooks/useNats";

export function App() {
  const { iras, error } = useIras("area3001.ira.>");
  if (error) {
    return <div className="bg-red-200">Error: {error.message}</div>;
  }

  return (
    <main>
      <Table iras={iras} />
    </main>
  );
}
