import dayjs, { Dayjs } from 'dayjs'
import { Calendar, DateItem, DateObj, Month } from './types'
import { EmptyDate } from './types'
import { EventHandler, SyntheticEvent } from 'react'

const emptyDate = '' as EmptyDate

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function composeEventHandlers<E extends SyntheticEvent<any>>(
  ...fns: EventHandler<E>[]
) {
  return (event: E) =>
    fns.some((fn) => {
      fn?.(event)
      return event.defaultPrevented
    })
}

export function requiredProp(fnName: string, propName: string): never {
  throw new Error(`The property "${propName}" is required in "${fnName}"`)
}

export function unwrapChildrenForPreact(arg: unknown) {
  arg = Array.isArray(arg) ? arg[0] : arg
  return arg || noop
}

export const noop = () => {}

export function subtractMonth({
  calendars,
  offset,
  minDate,
}: {
  calendars: Calendar[]
  offset: number
  minDate?: Dayjs
}): number {
  const firstDayOfMonth = calendars.at(0)?.start.startOf('month')
  if (offset > 1 && minDate && firstDayOfMonth) {
    const diffInMonths = firstDayOfMonth.diff(minDate, 'month')
    if (diffInMonths < offset) {
      return diffInMonths
    }
  }
  return offset
}

export function addMonth({
  calendars,
  offset,
  maxDate,
}: {
  calendars: Calendar[]
  offset: number
  maxDate?: Dayjs
}): number {
  if (offset > 1 && maxDate) {
    const lastDayOfMonth = calendars[calendars.length - 1].start.endOf('month')
    const diffInMonths = maxDate.diff(lastDayOfMonth, 'month')
    if (diffInMonths < offset) {
      offset = diffInMonths
    }
  }
  return offset
}

export function isBackDisabled({
  calendars,
  minDate,
}: {
  calendars: Calendar[]
  minDate?: Dayjs
}): boolean {
  if (!minDate) return false
  const firstDayOfMonth = calendars[0].start.startOf('month')
  return firstDayOfMonth.subtract(1, 'day').isBefore(minDate)
}

export function isForwardDisabled({
  calendars,
  maxDate,
}: {
  calendars: Calendar[]
  maxDate?: Dayjs
}): boolean {
  if (!maxDate) return false
  const lastDayOfMonth = calendars[calendars.length - 1].start.endOf('month')
  return lastDayOfMonth.add(1, 'day').isAfter(maxDate)
}

export function getCalendars({
  date,
  selected,
  monthsToDisplay,
  offset,
  minDate,
  maxDate,
  firstDayOfWeek,
  showOutsideDays,
}: {
  date?: Dayjs
  selected?: Dayjs | Dayjs[]
  monthsToDisplay: number
  offset: number
  minDate?: Dayjs
  maxDate?: Dayjs
  firstDayOfWeek: number
  showOutsideDays: boolean
}): Calendar[] {
  const months: Calendar[] = []
  const startDate = getStartDate(date || dayjs(), minDate, maxDate)

  for (let i = 0; i < monthsToDisplay; i++) {
    const calendarDates = getMonths({
      month: startDate.month() + i + offset,
      year: startDate.year(),
      selectedDates: selected,
      minDate,
      maxDate,
      firstDayOfWeek,
      showOutsideDays,
    })
    months.push(calendarDates)
  }
  return months
}

function getStartDate(date: Dayjs, minDate?: Dayjs, maxDate?: Dayjs): Dayjs {
  let startDate = date.startOf('day')

  if (minDate) {
    const minDateNormalized = minDate.startOf('day')
    if (startDate.isBefore(minDateNormalized)) {
      startDate = minDateNormalized
    }
  }

  if (maxDate) {
    const maxDateNormalized = maxDate.startOf('day')
    if (maxDateNormalized.isBefore(startDate)) {
      startDate = maxDateNormalized
    }
  }

  return startDate
}

function getMonths({
  month,
  year,
  selectedDates,
  minDate,
  maxDate,
  firstDayOfWeek,
  showOutsideDays,
}: {
  month: number
  year: number
  selectedDates?: Dayjs | Dayjs[]
  minDate?: Dayjs
  maxDate?: Dayjs
  firstDayOfWeek: number
  showOutsideDays: boolean
}): Calendar {
  const normalizedDate = dayjs().year(year).month(month).startOf('month')
  const daysInMonth = normalizedDate.daysInMonth()

  const dates: DateItem[] = []
  for (let day = 1; day <= daysInMonth; day++) {
    const date = dayjs().year(year).month(month).date(day)
    const dateObj: DateObj = {
      date,
      selected: isSelected(selectedDates, date),
      selectable: isSelectable(minDate, maxDate, date),
      today: date.isSame(dayjs(), 'day'),
      prevMonth: false,
      nextMonth: false,
    }
    dates.push(dateObj)
  }

  const yearMonth = dayjs().year(year).month(month)
  const firstDayOfMonth = yearMonth.startOf('month')
  const lastDayOfMonth = yearMonth.endOf('month')

  const frontWeekBuffer = fillFrontWeek({
    firstDayOfMonth,
    minDate,
    maxDate,
    selectedDates,
    firstDayOfWeek,
    showOutsideDays,
  })

  const backWeekBuffer = fillBackWeek({
    lastDayOfMonth,
    minDate,
    maxDate,
    selectedDates,
    firstDayOfWeek,
    showOutsideDays,
  })

  dates.unshift(...frontWeekBuffer)
  dates.push(...backWeekBuffer)

  return {
    start: firstDayOfMonth,
    month: normalizedDate.month() as Month,
    year: normalizedDate.year(),
    weeks: getWeeks(dates),
  }
}

type FillFrontWeekParams = {
  firstDayOfMonth: Dayjs
  minDate?: Dayjs
  maxDate?: Dayjs
  selectedDates?: Dayjs | Dayjs[]
  firstDayOfWeek: number
  showOutsideDays: boolean
}

function fillFrontWeek({
  firstDayOfMonth,
  minDate,
  maxDate,
  selectedDates,
  firstDayOfWeek,
  showOutsideDays,
}: FillFrontWeekParams): DateItem[] {
  const dates: DateItem[] = []
  let firstDay = (firstDayOfMonth.day() + 7 - firstDayOfWeek) % 7

  if (showOutsideDays) {
    const lastDayOfPrevMonth = firstDayOfMonth.subtract(1, 'day')

    let counter = 0
    while (counter < firstDay) {
      const date = lastDayOfPrevMonth.subtract(counter, 'day')
      const dateObj: DateObj = {
        date,
        selected: isSelected(selectedDates, date),
        selectable: isSelectable(minDate, maxDate, date),
        today: false,
        prevMonth: true,
        nextMonth: false,
      }
      dates.unshift(dateObj)
      counter++
    }
  } else {
    while (firstDay > 0) {
      dates.unshift(emptyDate)
      firstDay--
    }
  }

  return dates
}

type FillBackWeekParams = {
  lastDayOfMonth: Dayjs
  minDate?: Dayjs
  maxDate?: Dayjs
  selectedDates?: Dayjs | Dayjs[]
  firstDayOfWeek: number
  showOutsideDays: boolean
}

function fillBackWeek({
  lastDayOfMonth,
  minDate,
  maxDate,
  selectedDates,
  firstDayOfWeek,
  showOutsideDays,
}: FillBackWeekParams): DateItem[] {
  const dates: DateItem[] = []
  let lastDay = (lastDayOfMonth.day() + 7 - firstDayOfWeek) % 7

  if (showOutsideDays) {
    let counter = 0
    while (counter < 6 - lastDay) {
      const date = lastDayOfMonth.add(counter + 1, 'day')
      const dateObj: DateObj = {
        date,
        selected: isSelected(selectedDates, date),
        selectable: isSelectable(minDate, maxDate, date),
        today: false,
        prevMonth: false,
        nextMonth: true,
      }
      dates.push(dateObj)
      counter++
    }
  } else {
    while (lastDay < 6) {
      dates.push(emptyDate)
      lastDay++
    }
  }

  return dates
}

function getWeeks(dates: DateItem[]): DateItem[][] {
  const weeksLength = Math.ceil(dates.length / 7)
  const weeks: DateItem[][] = []

  for (let i = 0; i < weeksLength; i++) {
    weeks[i] = []
    for (let x = 0; x < 7; x++) {
      weeks[i].push(dates[i * 7 + x])
    }
  }

  return weeks
}

function isSelected(
  selectedDates: Dayjs | Dayjs[] | undefined,
  date: Dayjs,
): boolean {
  if (!selectedDates) return false

  const dates = Array.isArray(selectedDates) ? selectedDates : [selectedDates]
  return dates.some(
    (selectedDate) =>
      selectedDate && selectedDate.startOf('day').isSame(date.startOf('day')),
  )
}

function isSelectable(
  minDate: Dayjs | undefined,
  maxDate: Dayjs | undefined,
  date: Dayjs,
): boolean {
  if (
    (minDate && date.isBefore(minDate)) ||
    (maxDate && date.isAfter(maxDate))
  ) {
    return false
  }
  return true
}
