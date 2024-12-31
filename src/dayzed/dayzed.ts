/**
 * This file is dayzed re-written in TypeScript and uses Day.js instead of Moment.js
 */

import {
  HTMLProps,
  MouseEvent,
  MouseEventHandler,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from 'react'
import dayjs, { Dayjs } from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import { Calendar, DateObj } from './types'
import {
  composeEventHandlers,
  getCalendars,
  noop,
  requiredProp,
  subtractMonth,
} from './utils'

dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)

interface DayzedData {
  calendars: Calendar[]
  getDateProps: (args?: GetDatePropsArgs) => DateProps
  getBackProps: (args?: GetNavigationPropsArgs) => NavigationProps
  getForwardProps: (args?: GetNavigationPropsArgs) => NavigationProps
}

/* eslint-disable @typescript-eslint/no-explicit-any */

interface GetDatePropsArgs {
  onClick?: MouseEventHandler
  dateObj?: DateObj
  [key: string]: any
}

interface GetNavigationPropsArgs {
  onClick?: MouseEventHandler
  offset?: number
  calendars?: Calendar[]
  [key: string]: any
}

interface DateProps {
  onClick: MouseEventHandler
  disabled: boolean
  'aria-label': string
  'aria-pressed': boolean
  role: string
  [key: string]: any
}

interface NavigationProps {
  onClick: MouseEventHandler
  disabled: boolean
  'aria-label': string
  [key: string]: any
}

/* eslint-enable @typescript-eslint/no-explicit-any */

const addMonth = ({
  calendars,
  offset,
  maxDate,
}: {
  calendars: Calendar[]
  offset: number
  maxDate?: Dayjs
}): number => {
  if (!maxDate) return offset
  const date = dayjs()
    .year(calendars[calendars.length - 1].year)
    .month(calendars[calendars.length - 1].month)
  return date.add(offset, 'month').isAfter(maxDate) ? 0 : offset
}

const isBackDisabled = ({
  calendars,
  offset,
  minDate,
}: {
  calendars: Calendar[]
  offset: number
  minDate?: Dayjs
}): boolean => {
  return minDate ? subtractMonth({ calendars, offset, minDate }) === 0 : false
}

const isForwardDisabled = ({
  calendars,
  offset,
  maxDate,
}: {
  calendars: Calendar[]
  offset: number
  maxDate?: Dayjs
}): boolean => {
  return maxDate ? addMonth({ calendars, offset, maxDate }) === 0 : false
}

export function useDayzed({
  date = dayjs(),
  maxDate,
  minDate,
  monthsToDisplay = 1,
  firstDayOfWeek = 0,
  showOutsideDays = false,
  offset,
  onDateSelected,
  onOffsetChanged = () => {},
  selected,
}: DayzedProps): DayzedData {
  const [stateOffset, setStateOffset] = useState(0)
  const offsetMonth = offset !== undefined ? offset : stateOffset

  const handleOffsetChanged = useCallback(
    (newOffset: number) => {
      if (offset === undefined) {
        setStateOffset(newOffset)
      }
      onOffsetChanged(newOffset)
    },
    [offset, onOffsetChanged],
  )

  const getDateProps = useCallback(
    (args: GetDatePropsArgs = {}) => {
      const {
        onClick = noop,
        dateObj = requiredProp('getDateProps', 'dateObj'),
        ...rest
      } = args
      return {
        onClick: composeEventHandlers(onClick, (event) => {
          onDateSelected(dateObj, event)
        }),
        disabled: !dateObj.selectable,
        'aria-label': dateObj.date.format('ddd MMM DD YYYY'),
        'aria-pressed': dateObj.selected,
        role: 'button',
        ...rest,
      }
    },
    [onDateSelected],
  )

  const getBackProps = useCallback(
    (args: GetNavigationPropsArgs = {}) => {
      const {
        onClick = noop,
        offset = 1,
        calendars = requiredProp('getBackProps', 'calendars'),
        ...rest
      } = args
      return {
        onClick: composeEventHandlers(onClick, () => {
          handleOffsetChanged(
            offsetMonth - subtractMonth({ calendars, offset, minDate }),
          )
        }),
        disabled: isBackDisabled({ calendars, offset, minDate }),
        'aria-label': `Go back ${offset} month${offset === 1 ? '' : 's'}`,
        ...rest,
      }
    },
    [handleOffsetChanged, minDate, offsetMonth],
  )

  const getForwardProps = useCallback(
    (args: GetNavigationPropsArgs = {}) => {
      const {
        onClick = noop,
        offset = 1,
        calendars = requiredProp('getForwardProps', 'calendars'),
        ...rest
      } = args
      return {
        onClick: composeEventHandlers(onClick, () => {
          handleOffsetChanged(
            offsetMonth + addMonth({ calendars, offset, maxDate }),
          )
        }),
        disabled: isForwardDisabled({ calendars, offset, maxDate }),
        'aria-label': `Go forward ${offset} month${offset === 1 ? '' : 's'}`,
        ...rest,
      }
    },
    [handleOffsetChanged, maxDate, offsetMonth],
  )

  const calendars = useMemo(
    () =>
      getCalendars({
        date,
        selected,
        monthsToDisplay,
        minDate,
        maxDate,
        offset: offsetMonth,
        firstDayOfWeek,
        showOutsideDays,
      }),
    [
      date,
      selected,
      monthsToDisplay,
      minDate,
      maxDate,
      offsetMonth,
      firstDayOfWeek,
      showOutsideDays,
    ],
  )

  return {
    calendars,
    getDateProps,
    getBackProps,
    getForwardProps,
  }
}

export interface GetBackForwardPropsOptions
  extends HTMLProps<HTMLButtonElement> {
  calendars: Calendar[]
  offset?: number
}

interface GetDatePropsOptions extends HTMLProps<HTMLButtonElement> {
  dateObj: DateObj
}

/* eslint-disable @typescript-eslint/no-explicit-any */

export type RenderProps = {
  calendars: Calendar[]
  getBackProps: (data: GetBackForwardPropsOptions) => Record<string, any>
  getForwardProps: (data: GetBackForwardPropsOptions) => Record<string, any>
  getDateProps: (data: GetDatePropsOptions) => Record<string, any>
}

/* eslint-enable @typescript-eslint/no-explicit-any */

type RenderFn = (renderProps: RenderProps) => ReactNode

export type DayzedProps = {
  date?: Dayjs
  maxDate?: Dayjs
  minDate?: Dayjs
  monthsToDisplay?: number
  firstDayOfWeek?: number
  showOutsideDays?: boolean
  offset?: number
  onDateSelected: (dateObj: DateObj, event: MouseEvent) => void
  onOffsetChanged?: (offset: number) => void
  selected?: Dayjs | Dayjs[]
  render?: RenderFn
  children?: RenderFn
}

const Dayzed = (props: DayzedProps) => {
  const dayzedData = useDayzed(props)
  const children = props.render || props.children
  return children?.(dayzedData)
}

Dayzed.defaultProps = {
  date: dayjs(),
  monthsToDisplay: 1,
  onOffsetChanged: () => {},
  firstDayOfWeek: 0,
  showOutsideDays: false,
}

export default Dayzed
