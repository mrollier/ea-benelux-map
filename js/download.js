// Client-side CSV export of whatever the filters currently show.
//
// The column order and the flattening rules below mirror ea_belgium_orgs.csv exactly
// (lists joined with "; ", relationships as "id:type"), so a filtered export and the
// full shipped file open the same way in the same spreadsheet.

export const CSV_COLUMNS = [
  "id", "name", "aka", "city", "lat", "lng", "cause_areas", "tier", "org_type",
  "founded", "key_people", "website", "careers_url", "funding", "description",
  "remote_note", "confidence", "verify", "sources", "relationships", "country",
];

function flatten(org, column) {
  const value = org[column];
  if (value === null || value === undefined) return "";
  if (column === "relationships") {
    return (value || []).map((r) => `${r.org}:${r.type}`).join("; ");
  }
  if (Array.isArray(value)) return value.join("; ");
  return String(value);
}

// RFC 4180: quote a field only when it needs it, and double any quote inside it.
function escapeField(text) {
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCSV(orgs, columns = CSV_COLUMNS) {
  const lines = [columns.join(",")];
  orgs.forEach((org) => {
    lines.push(columns.map((c) => escapeField(flatten(org, c))).join(","));
  });
  return `${lines.join("\r\n")}\r\n`;
}

export function downloadCSV(filename, csv) {
  // BOM so Excel opens the file as UTF-8 rather than mangling the accented org names.
  const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
