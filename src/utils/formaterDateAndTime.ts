export const formatTime = (date: Date): string => {
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };
  const timeStr = date.toLocaleTimeString("en-US", timeOptions);
  const [timePart, ampm] = timeStr.split(" ");
  let hours = timePart.split(":")[0];
  const minutes = timePart.split(":")[1];
  if (hours === "12" && ampm === "AM") {
    hours = "00";
  }
  const offset = date.getTimezoneOffset();
  const offsetHours = -(offset / 60);
  const gmtOffset = `GMT${offsetHours >= 0 ? "+" : ""}${offsetHours}`;
  return `${hours}:${minutes} ${ampm} ${gmtOffset}`;
};
