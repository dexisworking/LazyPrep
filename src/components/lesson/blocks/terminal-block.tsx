import { cn } from "@/lib/utils";

/**
 * Renders CLI output in a terminal window chrome. Content is plain text —
 * prompts (`Router#`, `Switch(config)>` …) are tinted, `!` comment lines dimmed.
 */
export function TerminalBlock({ raw }: { raw: string }) {
  const lines = raw.replace(/\n$/, "").split("\n");

  return (
    <div className="np-block my-6 overflow-hidden rounded-xl border border-border/70 bg-[oklch(0.13_0.008_260)] shadow-sm">
      <div className="flex items-center gap-1.5 border-b border-white/[0.06] bg-white/[0.03] px-3.5 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.60_0.22_25)]/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.72_0.17_55)]/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.70_0.18_155)]/80" />
        <span className="ml-2 text-[10px] font-medium uppercase tracking-wider text-white/40">
          CLI
        </span>
      </div>
      <pre className="overflow-x-auto p-4 text-[0.82rem] leading-relaxed">
        <code className="font-mono">
          {lines.map((line, i) => {
            const isComment = line.trimStart().startsWith("!");
            // Match an IOS-style prompt at line start: "R1#", "SW1(config-if)#", "Router>"
            const prompt = line.match(/^([\w.-]+(?:\([\w.-]+\))?[#>])(.*)$/);
            return (
              <span key={i} className="block whitespace-pre">
                {isComment ? (
                  <span className="italic text-white/35">{line || " "}</span>
                ) : prompt ? (
                  <>
                    <span className="font-semibold text-[oklch(0.72_0.17_55)]">{prompt[1]}</span>
                    <span className="text-white/85">{prompt[2]}</span>
                  </>
                ) : (
                  <span className={cn("text-white/70", line === "" && "block h-[1em]")}>
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
