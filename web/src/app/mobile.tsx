import { Tabs, TabsList, TabsTrigger } from "#components/ui/tabs"

import { useState, type ReactNode } from "react";
import { Edit, File, Terminal } from "lucide-react";

export interface Props {
  files: ReactNode;
  terminal: ReactNode;
  editor: ReactNode;
  navbar: ReactNode;
}

export function MobileView({ editor, files, terminal, navbar }: Props) {
  const [page, setPage] = useState("editor");
  const pageClass = (page: string, target: string, ignore = false) => ("w-full h-full rounded-md overflow-none flex items-start justify-start text-start" + (page == target ? "" : " hidden") + (!ignore ? " border border-border dark:bg-card! p-2" : ""));

  return <div className="flex flex-col w-full h-full overflow-hidden p-4 gap-2 items-center text-center">
    {navbar}

    <div className={pageClass(page, 'editor', true)}>{editor}</div>
    <div className={pageClass(page, 'files')}>{files}</div>
    <div className={pageClass(page, 'terminal')}>{terminal}</div>

    <div className="absolute bottom-0">
      <Tabs
        defaultValue={"editor"}
        onValueChange={setPage}
      >
        <TabsList
          className="gap-2 px-2 h-12! rounded-b-none"
        >
          <TabsTrigger value="files" className='h-8!'><File /> Files</TabsTrigger>
          <TabsTrigger value="editor" className='h-8!'><Edit /> Editor</TabsTrigger>
          <TabsTrigger value="terminal" className='h-8!'><Terminal /> Terminal</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  </div>;

}