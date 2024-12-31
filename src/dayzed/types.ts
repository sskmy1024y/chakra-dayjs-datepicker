import { Dayjs } from 'dayjs'

declare const __brand: unique symbol
type BrandType<B> = { [__brand]: B }
export type BrandedType<T, B> = T & BrandType<B>

export type DateObj = {
  date: Dayjs
  selected: boolean
  selectable: boolean
  today: boolean
  prevMonth: boolean
  nextMonth: boolean
}

export type EmptyDate = BrandedType<'', 'EmptyDate'>

export type DateItem = DateObj | EmptyDate

export type Month = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11

export type Calendar = {
  start: Dayjs
  month: Month
  year: number
  weeks: DateItem[][]
}
