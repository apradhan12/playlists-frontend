const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;

export function secondsToMinutesString(seconds: number) {
    return `${Math.floor(seconds / SECONDS_PER_MINUTE)}:${(seconds % SECONDS_PER_MINUTE).toString().padStart(2, "0")}`;
}

export function secondsToHoursString(seconds: number) {
    return `${Math.floor(seconds / (SECONDS_PER_MINUTE * MINUTES_PER_HOUR))} hr ${(Math.floor(seconds % (SECONDS_PER_MINUTE * MINUTES_PER_HOUR) / SECONDS_PER_MINUTE))} min`;
}

export function sum(nums: number[]) {
    return nums.reduce((a, b) => a + b, 0)
}

export function convertDate(date?: string) {
    if (date === undefined) {
        return "2021-03-30";
    }
    const parsedDate = new Date(date);
    const paddedMonth = (parsedDate.getMonth() + 1).toString().padStart(2, "0");
    const paddedDate = parsedDate.getDate().toString().padStart(2, "0");
    return `${parsedDate.getFullYear()}-${paddedMonth}-${paddedDate}`;
}
