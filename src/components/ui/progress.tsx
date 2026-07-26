"use client"

import { Progress as ProgressPrimitive } from "@base-ui/react/progress"

import { cn } from "@/lib/utils"

/**
 * Note on `className`: it styles the Root, which is the flex *wrapper* around
 * the optional label/value row and the track — not the bar itself. Passing
 * `h-1.5 bg-secondary` here silently does nothing, which is what the navbar
 * was doing. Use `trackClassName` / `indicatorClassName`, or the `size` and
 * `tone` props, to style the bar.
 */
function Progress({
  className,
  trackClassName,
  indicatorClassName,
  children,
  value,
  size = "sm",
  tone = "primary",
  ...props
}: ProgressPrimitive.Root.Props & {
  trackClassName?: string
  indicatorClassName?: string
  size?: "xs" | "sm" | "md"
  tone?: "primary" | "success" | "xp" | "streak" | "destructive"
}) {
  return (
    <ProgressPrimitive.Root
      value={value}
      data-slot="progress"
      className={cn("flex flex-wrap gap-3", className)}
      {...props}
    >
      {children}
      <ProgressTrack className={cn(trackSizes[size], trackClassName)}>
        <ProgressIndicator className={cn(toneFills[tone], indicatorClassName)} />
      </ProgressTrack>
    </ProgressPrimitive.Root>
  )
}

const trackSizes = {
  xs: "h-1",
  sm: "h-1.5",
  md: "h-2",
} as const

const toneFills = {
  primary: "bg-primary",
  success: "bg-np-success",
  xp: "bg-np-xp",
  streak: "bg-streak-hot",
  destructive: "bg-destructive",
} as const

function ProgressTrack({ className, ...props }: ProgressPrimitive.Track.Props) {
  return (
    <ProgressPrimitive.Track
      className={cn(
        "relative flex h-1 w-full items-center overflow-x-hidden rounded-full bg-muted",
        className
      )}
      data-slot="progress-track"
      {...props}
    />
  )
}

function ProgressIndicator({
  className,
  ...props
}: ProgressPrimitive.Indicator.Props) {
  return (
    <ProgressPrimitive.Indicator
      data-slot="progress-indicator"
      className={cn(
        "h-full rounded-full bg-primary transition-[width] duration-(--dur-slow) ease-emphasized",
        className
      )}
      {...props}
    />
  )
}

function ProgressLabel({ className, ...props }: ProgressPrimitive.Label.Props) {
  return (
    <ProgressPrimitive.Label
      className={cn("text-sm font-medium", className)}
      data-slot="progress-label"
      {...props}
    />
  )
}

function ProgressValue({ className, ...props }: ProgressPrimitive.Value.Props) {
  return (
    <ProgressPrimitive.Value
      className={cn(
        "ml-auto text-sm text-muted-foreground tabular-nums",
        className
      )}
      data-slot="progress-value"
      {...props}
    />
  )
}

export {
  Progress,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
}
