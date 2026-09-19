import { Separator } from "#components/ui/separator";
import { useState } from "react";
import { useFsWorker } from "../../utils/fsService";
import { FileEntry } from "./entry";
import type { Entries } from "../../utils/fs/types";

interface Props {
  name: string;
  path: string[];
}

export function DirContaier({ name, path }: Props) {
  const [expanded, setExpanded] = useState(false);

  const dirPath = [...path, name];
  const state = useFsWorker(dirPath.join("/"), expanded);

  return <div className="w-full">
    <FileEntry name={name} kind="dir" expanded={expanded} loading={expanded && state === 'loading'} onClick={() => setExpanded((e) => !e)} />

    {expanded && <div className="flex w-full pl-3 gap-0.5">
      <Separator orientation="vertical" />

      <div className="w-full flex flex-col">
        <DirectoryListing entries={state} dirPath={dirPath} />
      </div>
    </div>}
  </div>;
}

export function DirectoryListing({ dirPath, entries }: { dirPath: string[], entries: Entries | 'loading' }) {
  if (entries == 'loading') return <></>;

  return <>
    {
      entries.map((val) => {
        const key = val.name + val.kind;

        if (val.kind == 'file') {
          return <FileEntry key={key} kind={val.kind} name={val.name} loading={false} />
        }

        return <DirContaier key={key} name={val.name} path={dirPath} />
      })
    }
  </>;
}