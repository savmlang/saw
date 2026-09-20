import { Spinner } from "#components/ui/spinner";
import small from "../assets/small.svg";

export default function Editor({ loading, text }: { loading: boolean, text?: string }) {
  return <div className="w-full h-full border border-zinc-300 dark:border-border flex flex-col dark:bg-card rounded-md justify-center text-center items-center select-none">
    <img
      src={small}
      className="size-48 dark:invert opacity-70 dark:opacity-50"
      alt="SaVM Lightning Bolt Icon"
    />

    <h1 className="text-accent-foreground mt-4 select-none">SaVM Interactive Playground</h1>

    {loading ?
      <div className="flex gap-1 justify-center items-center text-center text-muted-foreground mt-5">
        <Spinner />
        <span>{text || "Loading Editor"}</span>
      </div> :

      <div className="flex gap-1 justify-center items-center text-center text-muted-foreground mt-5">
        <span>Open a file to launch editor</span>
      </div>
    }
  </div>
}