import {
  BoxProps,
  FlexProps,
  HeadingProps,
  InputProps,
  PopoverBodyProps,
  PopoverRootProps,
  SeparatorProps,
  SimpleGridProps,
  StackProps,
} from '@chakra-ui/react'
import { DateObj } from '../dayzed'
import { ButtonProps } from '../components/snippets/button'
import { PopoverContentProps } from '../components/snippets/popover'
import { Dayjs } from 'dayjs'

export type OnDateSelected = (
  selectedDate: DateObj,
  event: React.SyntheticEvent<Element, Event>,
) => void

export interface DatepickerProps {
  minDate?: Dayjs
  maxDate?: Dayjs
  propsConfigs?: PropsConfigs
}

export interface DayOfMonthBtnStyleProps {
  defaultBtnProps?: ButtonProps
  isInRangeBtnProps?: ButtonProps
  selectedBtnProps?: ButtonProps
  todayBtnProps?: ButtonProps
}

export interface PopoverCompProps {
  popoverRootProps?: PopoverRootProps
  popoverContentProps?: PopoverContentProps
  popoverBodyProps?: PopoverBodyProps
}

export interface CalendarPanelProps {
  wrapperProps?: StackProps
  contentProps?: StackProps
  headerProps?: StackProps
  bodyProps?: SimpleGridProps
  dividerProps?: SeparatorProps
}

export interface PropsConfigs {
  dateNavBtnProps?: ButtonProps
  dayOfMonthBtnProps?: DayOfMonthBtnStyleProps
  inputProps?: InputProps
  inputWrapProps?: FlexProps
  triggerBtnProps?: ButtonProps
  popoverCompProps?: PopoverCompProps
  calendarPanelProps?: CalendarPanelProps
  dateHeadingProps?: HeadingProps
  weekdayLabelProps?: BoxProps
}

export interface DatepickerConfigs {
  dateFormat?: string
  monthNames?: string[]
  dayNames?: string[]
  firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  monthsToDisplay?: number
}

export interface CalendarConfigs {
  dateFormat: string
  monthNames: string[]
  dayNames: string[]
  firstDayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6
}
