import { assertEquals, assertThrows } from "@std/assert";
import { test } from "@cross/test";
import { Cron } from "../src/croner.ts";

test("DST/Timezone", function () {
  let dayOne = new Date("2021-10-31T20:00:00"), // Last day of DST
    scheduler = new Cron("0 0 12 * * *", { timezone: "Etc/UTC", startAt: dayOne }),
    nextRun = scheduler.nextRun(); // Next run in local time

  // Do comparison
  assertEquals(nextRun?.getUTCHours(), 12);
});

test("Zero UTC offset", function () {
  let dayOne = new Date("2021-10-31T20:00:00"),
    scheduler = new Cron("0 0 12 * * *", { utcOffset: 0, startAt: dayOne }),
    nextRun = scheduler.nextRun(); // Next run in local time

  // Do comparison
  assertEquals(nextRun?.getUTCHours(), 12);
});

test("Neagtive UTC offset", function () {
  let dayOne = new Date("2021-10-31T20:00:00"),
    scheduler = new Cron("0 0 13 * * *", { utcOffset: -120, startAt: dayOne }),
    nextRun = scheduler.nextRun(); // Next run in local time

  // Do comparison
  assertEquals(nextRun?.getUTCHours(), 15);
});

test("Positive UTC offset", function () {
  let dayOne = new Date("2021-10-31T20:00:00"),
    scheduler = new Cron("0 0 13 * * *", { utcOffset: 480, startAt: dayOne }),
    nextRun = scheduler.nextRun(); // Next run in local time

  // Do comparison
  assertEquals(nextRun?.getUTCHours(), 5);
});

test("getTime should return expected difference with different timezones (now)", function () {
  let timeStockholm = new Cron("* * * * * *", { timezone: "Europe/Stockholm" }).nextRun()
      ?.getTime(),
    timeNewYork = new Cron("* * * * * *", { timezone: "America/New_York" }).nextRun()?.getTime();

  // The time right now should be the same in utc whether in new york or stockholm. Allow a 4 second difference.
  assertEquals(true, timeStockholm && timeStockholm >= (timeNewYork || 0) - 4000);
  assertEquals(true, timeStockholm && timeStockholm <= (timeNewYork || 0) + 4000);
});
test("getTime should return expected difference with different timezones (next 31st october)", function () {
  let refTime = new Date();
  refTime.setFullYear(2021);
  refTime.setMonth(8);

  let timeStockholm = new Cron("0 0 12 30 10 *", { timezone: "Europe/Stockholm" }).nextRun(refTime)
      ?.getTime(),
    timeNewYork = new Cron("0 0 12 30 10 *", { timezone: "America/New_York" }).nextRun(refTime)
      ?.getTime(),
    diff = ((timeNewYork || 0) - (timeStockholm || 0)) / 1000 / 3600;

  // The time when next sunday 1st november occur should be with 6 hours difference (seen from utc)
  assertEquals(diff, 6);
});

test("Should return expected time, date and weekday different timezones", function () {
  let refTime = new Date();
  refTime.setFullYear(2022);
  refTime.setDate(8);
  refTime.setMonth(1);
  refTime.setHours(12);

  let timeStockholm = new Cron("0 0 23 8 2 2", { timezone: "Europe/Stockholm" }).nextRun(refTime),
    timeNewYork = new Cron("0 0 23 8 2 2", { timezone: "America/New_York" }).nextRun(refTime);

  assertEquals(timeStockholm?.getUTCMonth(), 1);
  assertEquals(timeStockholm?.getUTCDate(), 8);
  assertEquals(timeStockholm?.getUTCHours(), 22);
  assertEquals(timeStockholm?.getUTCFullYear(), 2022);

  assertEquals(timeNewYork?.getUTCMonth(), 1);
  assertEquals(timeNewYork?.getUTCDate(), 9);
  assertEquals(timeNewYork?.getUTCHours(), 4);
  assertEquals(timeNewYork?.getUTCFullYear(), 2022);
});

test("getTime should return expected difference with different timezones (next 1st november)", function () {
  let timeStockholm = new Cron("0 0 12 1 11 *", { timezone: "Europe/Stockholm" }).nextRun()
      ?.getTime(),
    timeNewYork = new Cron("0 0 12 1 11 *", { timezone: "America/New_York" }).nextRun()?.getTime(),
    diff = ((timeNewYork || 0) - (timeStockholm || 0)) / 1000 / 3600;

  // The time when next sunday 1st november occur should be with 6 hours difference (seen from utc)
  assertEquals(diff, 5);
});

test("0 0 0 * * * with 365 iterations should return 365 days from now in America/New_York", function () {
  let startAt = new Date(Date.parse("2023-01-01T12:00:00.000Z")),
    scheduler = new Cron("0 0 0 * * *", { timezone: "America/New_York", startAt }),
    nextRun,
    prevRun = new Date(startAt.getTime()),
    iterations = 365,
    compareDay = new Date(startAt.getTime());

  compareDay.setDate(compareDay.getDate() + iterations);

  while (iterations-- > 0) {
    //@ts-ignore
    nextRun = scheduler.nextRun(prevRun), prevRun = nextRun;
  }

  // Set seconds, minutes and hours to 00:00:00
  compareDay.setMilliseconds(0);
  compareDay.setSeconds(0);
  compareDay.setMinutes(0);
  compareDay.setHours(0);

  // Do comparison
  //@ts-ignore
  assertEquals(Math.abs(nextRun?.getTime() - compareDay.getTime()) < 13 * 60 * 60 * 1000, true);
});

test("0 30 2 * * * with 365 iterations should return 365 days from now in America/New_York", function () {
  let startAt = new Date(Date.parse("2023-01-01T12:00:00.000Z")),
    scheduler = new Cron("0 30 2 * * *", { timezone: "America/New_York", startAt }),
    nextRun,
    prevRun = new Date(startAt.getTime()),
    iterations = 365,
    compareDay = new Date(startAt.getTime());

  compareDay.setDate(compareDay.getDate() + iterations);

  while (iterations-- > 0) {
    //@ts-ignore
    nextRun = scheduler.nextRun(prevRun), prevRun = nextRun;
  }

  // Set seconds, minutes and hours to 00:00:00
  compareDay.setMilliseconds(0);
  compareDay.setSeconds(0);
  compareDay.setMinutes(0);
  compareDay.setHours(0);

  // Do comparison
  //@ts-ignore
  assertEquals(Math.abs(nextRun?.getTime() - compareDay.getTime()) < 13 * 60 * 60 * 1000, true);
});

test("0 30 1 * * * with 365 iterations should return 365 days from now in America/New_York", function () {
  let startAt = new Date(Date.parse("2023-01-01T12:00:00.000Z")),
    scheduler = new Cron("0 30 1 * * *", { timezone: "America/New_York", startAt }),
    nextRun,
    prevRun = new Date(startAt.getTime()),
    iterations = 365,
    compareDay = new Date(startAt.getTime());

  compareDay.setDate(compareDay.getDate() + iterations);

  while (iterations-- > 0) {
    //@ts-ignore
    nextRun = scheduler.nextRun(prevRun), prevRun = nextRun;
  }

  // Set seconds, minutes and hours to 00:00:00
  compareDay.setMilliseconds(0);
  compareDay.setSeconds(0);
  compareDay.setMinutes(0);
  compareDay.setHours(0);

  // Do comparison
  //@ts-ignore
  assertEquals(Math.abs(nextRun?.getTime() - compareDay.getTime()) < 13 * 60 * 60 * 1000, true);
});

test("0 30 2 * * * with 365 iterations should return 366 days from now in Europe/Berlin", function () {
  let startAt = new Date(Date.parse("2023-02-15T12:00:00.000Z")),
    scheduler = new Cron("0 30 2 * * *", { timezone: "Europe/Berlin", startAt }),
    prevRun = new Date(startAt.getTime()),
    nextRun,
    iterations = 365,
    compareDay = new Date(startAt.getTime());

  compareDay.setDate(compareDay.getDate() + iterations);

  while (iterations-- > 0) {
    nextRun = scheduler.nextRun(prevRun);
    //@ts-ignore
    prevRun = nextRun;
  }

  // Set seconds, minutes and hours to 00:00:00
  compareDay.setMilliseconds(0);
  compareDay.setSeconds(0);
  compareDay.setMinutes(0);
  compareDay.setHours(0);

  // Do comparison
  //@ts-ignore
  assertEquals(Math.abs(nextRun?.getTime() - compareDay.getTime()) < 13 * 60 * 60 * 1000, true);
});
