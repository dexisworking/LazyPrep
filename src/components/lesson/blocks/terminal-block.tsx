import { cn } from "@/lib/utils";

/**
 * Renders CLI output in a terminal window chrome. Content is plain text —
 * prompts (`Router#`, `Switch(config)>` …) are tinted, `!` comment lines dimmed.
 *
 * The chrome stays dark in both themes by design (a CLI window reads as an
 * appliance, like an embedded editor). It is driven by the `terminal-*` tokens
 * rather than the raw `oklch()` literals and `white/N` opacities this used to
 * carry, so the palette is controllable in one place.
 */
export function TerminalBlock({ raw }: { raw: string }) {
  const lines = raw.replace(/\n$/, "").split("\n");

  return (
    <div className="np-block my-6 overflow-hidden rounded-card border border-border bg-terminal-bg shadow-card">
      <div className="flex items-center gap-1.5 border-b border-terminal-border bg-terminal-chrome px-3.5 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-terminal-dot-red" />
        <span className="h-2.5 w-2.5 rounded-full bg-terminal-dot-amber" />
        <span className="h-2.5 w-2.5 rounded-full bg-terminal-dot-green" />
        <span className="ml-2 text-3xs font-medium uppercase tracking-wider text-terminal-fg-dim">
          CLI
        </span>
      </div>
      <pre className="overflow-x-auto p-4 text-xs leading-relaxed">
        <code className="font-mono">
          {lines.map((line, i) => {
            const isComment = line.trimStart().startsWith("!");
            // Match an IOS-style prompt at line start: "R1#", "SW1(config-if)#", "Router>"
            const prompt = line.match(/^([\w.-]+(?:\([\w.-]+\))?[#>])(.*)$/);
            return (
              <span key={i} className="block whitespace-pre">
                {isComment ? (
                  <span className="italic text-terminal-fg-dim">{line || " "}</span>
                ) : prompt ? (
                  <>
                    <span className="font-semibold text-terminal-prompt">{prompt[1]}</span>
                    <span className="text-terminal-fg-strong">{prompt[2]}</span>
                  </>
                ) : (
                  <span className={cn("text-terminal-fg", line === "" && "block h-[1em]")}>
                    {line || " "}
                  </span>
                )}
              </span>
            );
          })}
        </code>
      </pre>
    </div>
  );
}
