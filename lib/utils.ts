const chipMap: Record<string, string> = {
  // Green — success / positive
  Active:         "chip chip-green",
  Completed:      "chip chip-green",
  Paid:           "chip chip-green",
  Received:       "chip chip-green",
  Approved:       "chip chip-green",
  "Deal Won":     "chip chip-green",
  Done:           "chip chip-green",

  // Amber — neutral / pending
  "On Hold":      "chip chip-amber",
  Pending:        "chip chip-amber",
  "Under Review": "chip chip-amber",
  "Not Started":  "chip chip-amber",
  Draft:          "chip chip-amber",

  // Red — danger / failed
  Overdue:        "chip chip-red",
  Closed:         "chip chip-red",
  "Deal Lost":    "chip chip-red",
  Suspended:      "chip chip-red",
  Void:           "chip chip-red",

  // Blue — info / in progress
  "In Progress":  "chip chip-blue",
  Sent:           "chip chip-blue",
  "Call Done":    "chip chip-blue",

  // Purple — elevated / meeting
  "Client Meeting": "chip chip-purple",

  // Slate — neutral / new
  "New Lead":        "chip chip-slate",
  team_member:       "chip chip-slate",
  agency:            "chip chip-brand",
  main_admin:        "chip chip-purple",

  // Brand — owner roles
  agency_owner:      "chip chip-brand",
  agency_admin:      "chip chip-brand",
  platform_owner:    "chip chip-purple",
  platform_admin:    "chip chip-purple",

  // Labels
  "Agency Workspace": "chip chip-brand",
  "Main Admin Only":  "chip chip-purple",
};

export function chipClass(status: string): string {
  return chipMap[status] ?? "chip chip-slate";
}
