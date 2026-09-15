import { Spinner } from "#components/ui/spinner";
import small from "../assets/small.svg";

export default function Editor({ loading }: { loading: boolean }) {
  return <div className="w-full h-full flex flex-col justify-center text-center items-center select-none">
    <img
      src={small}
      className="size-48 dark:invert opacity-70 dark:opacity-50"
    />

    <h1 className="text-accent-foreground mt-4 select-none">SaVM Interactive Playground</h1>

    {loading ?
      <div className="flex gap-1 justify-center items-center text-center text-muted-foreground mt-5">
        <Spinner />
        <span>Loading Editor</span>
      </div> :

      <div className="flex gap-1 justify-center items-center text-center text-muted-foreground mt-5">
        <span>Open a file to launch editor</span>
      </div>
    }
  </div>
}