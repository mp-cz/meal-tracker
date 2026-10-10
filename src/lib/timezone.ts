// The browser stores its IANA timezone in the "tz" cookie (see dashboard/date-picker.tsx)
// so day boundaries are computed in the user's zone, not the server's.
export function resolveTimeZone(value: string | undefined) {
  if (!value) return "UTC";
  try {
    new Intl.DateTimeFormat(undefined, { timeZone: value });
    return value;
  } catch {
    return "UTC";
  }
}
