import dayjs from "dayjs";

interface FormatOption {
  day?: string;
  year?: string;
  other?: string;
}

/**
 * 格式化时间
 * @param {number} timestamp
 * @param {FormatOption} options
 *
 * @returns {string}
 */
export const formatTime = function (
  timestamp: number,
  options: FormatOption = {}
): string {
  const day = dayjs.unix(timestamp);
  const now = dayjs();
  if (day.isSame(now, "day")) {
    return day.format(options.day || "HH:mm");
  } else if (day.isSame(now, "year")) {
    return day.format(options.year || "MM/DD HH:mm");
  } else {
    return day.format(options.other || "YYYY/MM/DD HH:mm");
  }
};
