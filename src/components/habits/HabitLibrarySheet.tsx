import { useEffect, useState, type ReactNode } from "react"
import {
  BookOpen,
  Brain,
  ChevronLeft,
  Dumbbell,
  Droplets,
  NotebookPen,
  Plus,
  ShowerHead,
  Sparkles,
  Timer,
  Trash2,
  Target,
  Wind,
  X,
  type LucideIcon,
} from "lucide-react"
import { toast } from "sonner"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SegmentedControl } from "@/components/layout/SegmentedControl"
import { CustomHabitForm } from "./CustomHabitForm"
import { createHabit, deleteHabit, updateHabit } from "@/lib/api"
import {
  customDraftToPayload,
  draftFromHabit,
  emptyCustomDraft,
  isCustomHabit,
  validateCustomDraft,
  type CustomHabitDraft,
} from "@/lib/customHabit"
import {
  displayHabitName,
  formatGoalSummary,
  getTemplateForHabit,
  HABIT_TEMPLATES,
  isTemplateAlreadyAdded,
  type GoalVariant,
  type HabitTemplate,
} from "@/lib/habitTemplates"
import type { Habit } from "@/lib/types"
import { CHALLENGE_HABIT_COUNT } from "@/lib/scoring"
import { useApp } from "@/context/AppContext"
import { cn } from "@/lib/utils"

const TEMPLATE_ICONS: Record<string, LucideIcon> = {
  "book-open": BookOpen,
  "notebook-pen": NotebookPen,
  brain: Brain,
  droplets: Droplets,
  wind: Wind,
  dumbbell: Dumbbell,
  "shower-head": ShowerHead,
  timer: Timer,
  target: Target,
}

const inputClass = "mt-1.5 h-12 rounded-lg bg-input-background text-base"

type HabitLibrarySheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  habits: Habit[]
  /** Open directly on a habit's edit screen (e.g. from Today). */
  initialHabitId?: string | null
}

type Screen = "roster" | "edit" | "add" | "addCustom"

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h3 className="font-mono-label text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
      {children}
    </h3>
  )
}

export function HabitLibrarySheet({
  open,
  onOpenChange,
  habits,
  initialHabitId,
}: HabitLibrarySheetProps) {
  const { me, refresh } = useApp()
  const [loading, setLoading] = useState(false)
  const [screen, setScreen] = useState<Screen>("roster")
  const [activeHabitId, setActiveHabitId] = useState<string | null>(null)

  const [editVariantId, setEditVariantId] = useState("")
  const [editTarget, setEditTarget] = useState("1")
  const [customDraft, setCustomDraft] = useState<CustomHabitDraft>(emptyCustomDraft)

  const [addTemplate, setAddTemplate] = useState<HabitTemplate | null>(null)
  const [addVariant, setAddVariant] = useState<GoalVariant | null>(null)
  const [addTarget, setAddTarget] = useState("1")
  /** When roster is full, habit to remove before adding a custom one. */
  const [replaceHabitId, setReplaceHabitId] = useState<string | null>(null)

  const slotsUsed = habits.length
  const slotsFull = slotsUsed >= CHALLENGE_HABIT_COUNT
  const rosterComplete = slotsUsed === CHALLENGE_HABIT_COUNT
  const slotPct = Math.min(100, Math.round((slotsUsed / CHALLENGE_HABIT_COUNT) * 100))

  const activeHabit = habits.find((h) => h.id === activeHabitId)
  const activeTemplate = activeHabit ? getTemplateForHabit(activeHabit) : undefined

  const availableTemplates = HABIT_TEMPLATES.filter((t) => !isTemplateAlreadyAdded(habits, t))

  useEffect(() => {
    if (!open) return
    if (initialHabitId && habits.some((h) => h.id === initialHabitId)) {
      openEdit(initialHabitId)
    } else {
      setScreen("roster")
      setActiveHabitId(null)
    }
  }, [open, initialHabitId, habits])

  function resetAdd() {
    setAddTemplate(null)
    setAddVariant(null)
    setAddTarget("1")
    setCustomDraft(emptyCustomDraft())
    setReplaceHabitId(null)
    setScreen("roster")
  }

  function openAddCustom() {
    setCustomDraft(emptyCustomDraft())
    setReplaceHabitId(slotsFull ? (habits[habits.length - 1]?.id ?? null) : null)
    setScreen("addCustom")
  }

  function openEdit(habitId: string) {
    const h = habits.find((x) => x.id === habitId)
    if (!h) return
    const template = getTemplateForHabit(h)
    const variant = template?.goalVariants.find(
      (v) => v.goal_mode === h.goal_mode && v.goal_unit === h.goal_unit,
    )
    setActiveHabitId(habitId)
    setEditVariantId(variant?.id ?? template?.goalVariants[0]?.id ?? "")
    setEditTarget(String(h.goal_target))
    setCustomDraft(isCustomHabit(h) ? draftFromHabit(h) : emptyCustomDraft())
    setScreen("edit")
  }

  function startAddTemplate(template: HabitTemplate) {
    setAddTemplate(template)
    const variant =
      template.goalVariants.find((v) => v.id === template.defaultVariantId) ??
      template.goalVariants[0]
    setAddVariant(variant)
    setAddTarget(String(variant.goal_target))
    setScreen("add")
  }

  async function handleSaveEdit() {
    if (!activeHabit) return
    const template = getTemplateForHabit(activeHabit)
    const variant = template?.goalVariants.find((v) => v.id === editVariantId)
    const target = Math.max(1, Number(editTarget) || 1)

    setLoading(true)
    try {
      if (template && variant) {
        await updateHabit(activeHabit.id, {
          name: template.name,
          icon: template.icon,
          goal_mode: variant.goal_mode,
          goal_target: target,
          goal_unit: variant.goal_unit,
        })
      } else {
        const err = validateCustomDraft(customDraft)
        if (err) {
          toast.error(err)
          return
        }
        const payload = customDraftToPayload(customDraft)
        await updateHabit(activeHabit.id, payload)
      }
      setScreen("roster")
      setActiveHabitId(null)
      await refresh()
      toast.success("Habit updated")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't update habit")
    } finally {
      setLoading(false)
    }
  }

  async function handleRemove() {
    if (!activeHabit) return
    if (!confirm(`Remove "${displayHabitName(activeHabit)}" from your roster?`)) return
    setLoading(true)
    try {
      await deleteHabit(activeHabit.id)
      setScreen("roster")
      setActiveHabitId(null)
      await refresh()
      toast.success("Habit removed — pick a replacement below")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't remove habit")
    } finally {
      setLoading(false)
    }
  }

  async function handleAddFromTemplate() {
    if (!me || !addTemplate || !addVariant) return
    if (isTemplateAlreadyAdded(habits, addTemplate)) {
      toast.error(`${addTemplate.name} is already on your roster`)
      return
    }
    if (slotsFull) {
      toast.error("Remove a habit first, then add a new one")
      return
    }
    const target = Math.max(1, Number(addTarget) || addVariant.goal_target)
    setLoading(true)
    try {
      await createHabit(me.id, {
        name: addTemplate.name,
        icon: addTemplate.icon,
        color_idx: habits.length % 8,
        habit_type: addTemplate.habit_type,
        goal_mode: addVariant.goal_mode,
        goal_target: target,
        goal_unit: addVariant.goal_unit,
        sort_order: habits.length,
      })
      resetAdd()
      await refresh()
      toast.success(`${addTemplate.name} added`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't add habit")
    } finally {
      setLoading(false)
    }
  }

  async function handleAddCustom() {
    if (!me) return
    if (slotsFull && !replaceHabitId) {
      toast.error("Choose a habit to replace")
      return
    }
    const err = validateCustomDraft(customDraft)
    if (err) {
      toast.error(err)
      return
    }
    const replaced = replaceHabitId ? habits.find((h) => h.id === replaceHabitId) : undefined
    setLoading(true)
    try {
      const payload = customDraftToPayload(customDraft)
      if (slotsFull && replaceHabitId) {
        await deleteHabit(replaceHabitId)
      }
      await createHabit(me.id, {
        ...payload,
        color_idx: replaced?.color_idx ?? habits.length % 8,
        sort_order: replaced?.sort_order ?? habits.length,
      })
      resetAdd()
      await refresh()
      toast.success(
        replaced
          ? `${payload.name} replaced ${displayHabitName(replaced)}`
          : `${payload.name} added`,
      )
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't add habit")
    } finally {
      setLoading(false)
    }
  }

  function closeSheet(v: boolean) {
    if (!v) {
      resetAdd()
      setScreen("roster")
      setActiveHabitId(null)
    }
    onOpenChange(v)
  }

  const headerTitle =
    screen === "edit"
      ? displayHabitName(activeHabit!)
      : screen === "add" && addTemplate
        ? `Add ${addTemplate.name}`
        : screen === "addCustom"
          ? "Custom habit"
          : "Manage Habits"

  return (
    <Sheet open={open} onOpenChange={closeSheet}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className={cn(
          "mx-auto flex max-h-[min(85dvh,680px)] w-[calc(100%-1.5rem)] max-w-[480px] flex-col gap-0",
          "rounded-t-3xl border border-border bg-card px-0 pb-0 shadow-2xl",
          "!bottom-3 !left-1/2 !right-auto !-translate-x-1/2",
        )}
      >
        {/* Drag handle + top breathing room */}
        <div
          className="flex shrink-0 flex-col items-center px-4 pt-[max(12px,env(safe-area-inset-top))]"
          aria-hidden="true"
        >
          <div className="h-1 w-10 rounded-full bg-muted-foreground/35" />
        </div>

        <SheetHeader className="shrink-0 border-b border-border px-4 pb-4 pt-2 text-left">
          <div className="flex items-start gap-2">
            {screen !== "roster" && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-11 w-11 shrink-0"
                onClick={() => {
                  if (screen === "add" || screen === "addCustom") resetAdd()
                  else {
                    setScreen("roster")
                    setActiveHabitId(null)
                  }
                }}
                aria-label="Back"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            <div className="min-w-0 flex-1 pr-2">
              <SheetTitle className="truncate font-display text-xl font-black uppercase tracking-wide">
                {headerTitle}
              </SheetTitle>
              {screen === "roster" && (
                <SheetDescription className="mt-0.5 text-sm text-muted-foreground">
                  Tap a habit to edit goal or remove it
                </SheetDescription>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-11 w-11 shrink-0 rounded-full border-border"
              onClick={() => closeSheet(false)}
              aria-label="Close habit library"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          {screen === "roster" && (
            <div className="mt-3">
              <div className="mb-1.5 flex items-center justify-between font-mono-label text-[10px] text-muted-foreground">
                <span>
                  Roster {slotsUsed}/{CHALLENGE_HABIT_COUNT}
                </span>
                <span className={cn(rosterComplete ? "text-primary" : "text-amber-400")}>
                  {rosterComplete ? "Eligible for ranks" : `${CHALLENGE_HABIT_COUNT - slotsUsed} slot open`}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-300",
                    rosterComplete ? "bg-primary" : "bg-amber-400",
                  )}
                  style={{ width: `${slotPct}%` }}
                />
              </div>
            </div>
          )}
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 pb-[calc(20px+env(safe-area-inset-bottom))]">
          {screen === "roster" && (
            <div className="flex flex-col gap-6">
              <section aria-labelledby="roster-heading">
                <SectionHeading>
                  <span id="roster-heading">Your roster</span>
                </SectionHeading>
                <div className="mt-3 space-y-2">
                  {habits.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
                      Pick {CHALLENGE_HABIT_COUNT} habits from the catalog below.
                    </p>
                  ) : (
                    habits.map((h, i) => {
                      const Icon = TEMPLATE_ICONS[h.icon] ?? Dumbbell
                      const label = displayHabitName(h)
                      return (
                        <button
                          key={h.id}
                          type="button"
                          onClick={() => openEdit(h.id)}
                          className="flex w-full min-h-[56px] items-center gap-3 rounded-lg border border-border bg-secondary/20 p-3 text-left transition-colors hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        >
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted font-mono-label text-[10px] font-bold text-muted-foreground">
                            {i + 1}
                          </span>
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                            <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-foreground">{label}</p>
                            <p className="font-mono-label text-[11px] text-muted-foreground">
                              {formatGoalSummary(h)} · 1 pt at goal
                            </p>
                          </div>
                          <span className="font-mono-label text-[10px] text-muted-foreground">Edit</span>
                        </button>
                      )
                    })
                  )}
                </div>
              </section>

              <section aria-labelledby="custom-create-heading">
                <SectionHeading>
                  <span id="custom-create-heading">Create your own</span>
                </SectionHeading>
                <button
                  type="button"
                  onClick={openAddCustom}
                  className="mt-3 flex w-full min-h-[56px] items-center gap-3 rounded-lg border border-dashed border-primary/40 bg-primary/5 p-3 text-left transition-colors hover:border-primary/60 hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15">
                    <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">Custom habit</p>
                    <p className="text-xs text-muted-foreground">
                      {slotsFull
                        ? "Swap one roster habit for your own · count or duration"
                        : "Name + daily goal · count or duration"}
                    </p>
                  </div>
                  <Plus className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                </button>
              </section>

              {!slotsFull && (
                <section aria-labelledby="catalog-heading">
                    <SectionHeading>
                      <span id="catalog-heading">Add from catalog</span>
                    </SectionHeading>
                    <p className="mt-1 text-xs text-muted-foreground">
                      One slot per habit type — no duplicates.
                    </p>
                    <div className="mt-3 grid grid-cols-1 gap-2">
                      {availableTemplates.length === 0 ? (
                        <p className="py-4 text-center text-sm text-muted-foreground">
                          All catalog habits are on your roster.
                        </p>
                      ) : (
                        availableTemplates.map((template) => {
                          const Icon = TEMPLATE_ICONS[template.icon] ?? Dumbbell
                          return (
                            <button
                              key={template.id}
                              type="button"
                              onClick={() => startAddTemplate(template)}
                              className="flex min-h-[52px] items-center gap-3 rounded-lg border border-border bg-secondary/20 p-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                            >
                              <Icon className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold">{template.name}</p>
                                <p className="text-xs text-muted-foreground">{template.description}</p>
                              </div>
                              <Plus className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                            </button>
                          )
                        })
                      )}
                    </div>
                </section>
              )}

              {slotsFull && (
                <p className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
                  Roster full. Tap a habit above to edit its goal, use{" "}
                  <span className="font-semibold text-foreground">Custom habit</span> to swap one out,
                  or remove a habit to pick from the catalog again.
                </p>
              )}
            </div>
          )}

          {screen === "edit" && activeHabit && (
            <div className="space-y-5">
              {activeTemplate ? (
                <>
                  {activeTemplate.goalVariants.length > 1 && (
                    <div>
                      <Label className="mb-2 block font-mono-label text-[10px] tracking-widest text-muted-foreground uppercase">
                        Track by
                      </Label>
                      <SegmentedControl
                        value={editVariantId}
                        onChange={setEditVariantId}
                        options={activeTemplate.goalVariants.map((v) => ({
                          value: v.id,
                          label: v.label,
                        }))}
                      />
                    </div>
                  )}
                  <div>
                    <Label htmlFor="edit-target" className="font-mono-label text-[10px] tracking-widest text-muted-foreground uppercase">
                      Daily target
                    </Label>
                    <Input
                      id="edit-target"
                      type="number"
                      inputMode="numeric"
                      value={editTarget}
                      onChange={(e) => setEditTarget(e.target.value)}
                      className={inputClass}
                    />
                    <p className="mt-1.5 font-mono-label text-[11px] text-muted-foreground">
                      Unit: {activeTemplate.goalVariants.find((v) => v.id === editVariantId)?.goal_unit ?? activeHabit.goal_unit}
                    </p>
                  </div>
                  <p className="font-mono-label text-[11px] leading-relaxed text-muted-foreground">
                    Complete the full goal each day to earn 1 point.
                  </p>
                  <Button
                    type="button"
                    className="h-12 w-full rounded-lg font-semibold"
                    disabled={loading}
                    onClick={handleSaveEdit}
                  >
                    Save changes
                  </Button>
                </>
              ) : (
                <CustomHabitForm
                  idPrefix="edit-custom"
                  draft={customDraft}
                  onChange={setCustomDraft}
                  onSubmit={handleSaveEdit}
                  submitLabel="Save changes"
                  loading={loading}
                />
              )}

              <Button
                type="button"
                variant="outline"
                className="h-12 w-full rounded-lg border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                disabled={loading}
                onClick={handleRemove}
              >
                <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                Remove from roster
              </Button>
            </div>
          )}

          {screen === "addCustom" && (
            <div className="space-y-5">
              {slotsFull && (
                <div className="space-y-3">
                  <p className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2.5 text-sm text-muted-foreground">
                    Roster is full ({CHALLENGE_HABIT_COUNT}/{CHALLENGE_HABIT_COUNT}). Choose which
                    habit to replace — your custom habit keeps the same slot.
                  </p>
                  <SectionHeading>Replace habit</SectionHeading>
                  <div className="space-y-2">
                    {habits.map((h) => {
                      const Icon = TEMPLATE_ICONS[h.icon] ?? Target
                      const selected = replaceHabitId === h.id
                      return (
                        <button
                          key={h.id}
                          type="button"
                          onClick={() => setReplaceHabitId(h.id)}
                          className={cn(
                            "flex w-full min-h-[52px] items-center gap-3 rounded-lg border p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                            selected
                              ? "border-primary bg-primary/10"
                              : "border-border bg-secondary/20 hover:border-primary/40",
                          )}
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                            <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">{displayHabitName(h)}</p>
                            <p className="font-mono-label text-[11px] text-muted-foreground">
                              {formatGoalSummary(h)}
                            </p>
                          </div>
                          {selected && (
                            <span className="font-mono-label text-[10px] font-bold text-primary">
                              Replace
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
              <CustomHabitForm
                draft={customDraft}
                onChange={setCustomDraft}
                onSubmit={handleAddCustom}
                submitLabel={slotsFull ? "Replace & add custom" : "Add to roster"}
                loading={loading}
                disabled={slotsFull && !replaceHabitId}
              />
            </div>
          )}

          {screen === "add" && addTemplate && addVariant && (
            <div className="space-y-5">
              {addTemplate.goalVariants.length > 1 && (
                <div>
                  <Label className="mb-2 block font-mono-label text-[10px] tracking-widest text-muted-foreground uppercase">
                    Track by
                  </Label>
                  <SegmentedControl
                    value={addVariant.id}
                    onChange={(id) => {
                      const v = addTemplate.goalVariants.find((x) => x.id === id)
                      if (v) {
                        setAddVariant(v)
                        setAddTarget(String(v.goal_target))
                      }
                    }}
                    options={addTemplate.goalVariants.map((v) => ({
                      value: v.id,
                      label: v.label,
                    }))}
                  />
                </div>
              )}
              <div>
                <Label htmlFor="add-target" className="font-mono-label text-[10px] tracking-widest text-muted-foreground uppercase">
                  Daily target ({addVariant.goal_unit})
                </Label>
                <Input
                  id="add-target"
                  type="number"
                  inputMode="numeric"
                  value={addTarget}
                  onChange={(e) => setAddTarget(e.target.value)}
                  className={inputClass}
                />
              </div>
              <Button
                type="button"
                className="h-12 w-full rounded-lg font-semibold"
                disabled={loading}
                onClick={handleAddFromTemplate}
              >
                Add to roster
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
