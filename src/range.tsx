import React, { RefObject, useCallback, useId, useMemo, useState } from 'react'
import { DayzedProps } from './dayzed'
import { Month_Names_Short, Weekday_Names_Short } from './utils/calanderUtils'
import { Flex, Input, PopoverOpenChangeDetails, Portal } from '@chakra-ui/react'
import { CalendarPanel } from './components/CalendarPanel'
import {
  CalendarConfigs,
  DatepickerConfigs,
  DatepickerProps,
  OnDateSelected,
  PropsConfigs,
} from './utils/types'
import FocusLock from 'react-focus-lock'
import { VariantProps } from './single'
import { CalendarIcon } from './components/CalendarIcon'
import { Button } from './components/snippets/button'
import {
  PopoverAnchor,
  PopoverBody,
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
} from './components/snippets/popover'
import dayjs, { Dayjs } from 'dayjs'

interface RangeCalendarPanelProps {
  dayzedHookProps: DayzedProps
  configs: CalendarConfigs
  propsConfigs?: PropsConfigs
  selected?: Dayjs | Dayjs[]
}

export const RangeCalendarPanel: React.FC<RangeCalendarPanelProps> = ({
  dayzedHookProps,
  configs,
  propsConfigs,
  selected,
}) => {
  const [hoveredDate, setHoveredDate] = useState<Dayjs | null>(null)

  // Calendar level
  const onMouseLeave = useCallback(() => {
    setHoveredDate(null)
  }, [])

  // Date level
  const onMouseEnterHighlight = useCallback(
    (date: Dayjs) => {
      if (!Array.isArray(selected) || !selected?.length) {
        return
      }
      setHoveredDate(date)
    },
    [selected],
  )

  const isInRange = useCallback(
    (date: Dayjs) => {
      if (!Array.isArray(selected) || !selected?.length) {
        return false
      }
      const firstSelected = selected[0]
      if (selected.length === 2) {
        const secondSelected = selected[1]
        return firstSelected < date && secondSelected > date
      } else {
        return (
          hoveredDate &&
          ((firstSelected < date && hoveredDate >= date) ||
            (date < firstSelected && date >= hoveredDate))
        )
      }
    },
    [hoveredDate, selected],
  )

  return (
    <Flex onMouseLeave={onMouseLeave}>
      <CalendarPanel
        dayzedHookProps={dayzedHookProps}
        configs={configs}
        propsConfigs={propsConfigs}
        isInRange={isInRange}
        onMouseEnterHighlight={onMouseEnterHighlight}
      />
    </Flex>
  )
}

interface RangeProps extends DatepickerProps {
  selectedDates: Dayjs[]
  configs?: DatepickerConfigs
  disabled?: boolean
  children?: (value: Dayjs[]) => React.ReactNode
  defaultIsOpen?: boolean
  closeOnSelect?: boolean
  onDateChange: (date: Dayjs[]) => void
  id?: string
  name?: string
  usePortal?: boolean
  portalRef?: React.MutableRefObject<null>
}

export type RangeDatepickerProps = RangeProps & VariantProps

const DefaultConfigs: Required<DatepickerConfigs> = {
  dateFormat: 'MM/DD/YYYY',
  monthNames: Month_Names_Short,
  dayNames: Weekday_Names_Short,
  firstDayOfWeek: 0,
  monthsToDisplay: 2,
}

export const RangeDatepicker: React.FC<RangeDatepickerProps> = ({
  selectedDates,
  disabled,
  onDateChange,
  id: _id,
  minDate,
  maxDate,
  configs,
  name,
  usePortal,
  portalRef,
  defaultIsOpen = false,
  closeOnSelect = true,
  children,
  ...restProps
}) => {
  // chakra popover utils
  const randomId = useId()
  const [dateInView, setDateInView] = useState<Dayjs>(
    selectedDates[0] || dayjs(),
  )
  const [offset, setOffset] = useState(0)
  const [open, setOpen] = useState(defaultIsOpen)
  const id = _id || randomId

  const onClose = useCallback(() => {
    setOpen(false)
  }, [])

  const Icon =
    restProps.triggerVariant === 'input' && restProps.triggerIcon ? (
      restProps.triggerIcon
    ) : (
      <CalendarIcon />
    )

  const datepickerConfigs = useMemo(
    () => ({
      ...DefaultConfigs,
      ...configs,
    }),
    [configs],
  )

  const onPopoverClose = useCallback(() => {
    onClose()
    setDateInView(selectedDates[0] || new Date())
    setOffset(0)
  }, [onClose, selectedDates])

  const onOpenChange = useCallback(
    (openDetails: PopoverOpenChangeDetails) => {
      setOpen(openDetails.open)
      if (!openDetails.open) {
        onPopoverClose()
      }
    },
    [onPopoverClose],
  )

  const handleOnDateSelected: OnDateSelected = ({ selectable, date }) => {
    if (!selectable) return
    const newDates = [...selectedDates]
    if (selectedDates.length) {
      if (selectedDates.length === 1) {
        const firstTime = selectedDates[0]
        if (firstTime < date) {
          newDates.push(date)
        } else {
          newDates.unshift(date)
        }
        onDateChange(newDates)

        if (closeOnSelect) onClose()
        return
      }

      if (newDates.length === 2) {
        onDateChange([date])
        return
      }
    } else {
      newDates.push(date)
      onDateChange(newDates)
    }
  }

  const intVal = useMemo(() => {
    let value = selectedDates[0]
      ? selectedDates[0].format(datepickerConfigs.dateFormat)
      : `${datepickerConfigs.dateFormat}`
    value += selectedDates[1]
      ? ` - ${selectedDates[1].format(datepickerConfigs.dateFormat)}`
      : ` - ${datepickerConfigs.dateFormat}`
    return value
  }, [datepickerConfigs.dateFormat, selectedDates])

  const PopoverContentWrapper = usePortal ? Portal : React.Fragment

  return (
    <PopoverRoot
      id={id}
      positioning={{
        placement: 'bottom-start',
      }}
      open={open}
      onOpenChange={onOpenChange}
      lazyMount
    >
      {!children && (restProps.triggerVariant ?? 'default') === 'default' ? (
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant={'outline'}
            lineHeight={1}
            paddingX="1rem"
            disabled={disabled}
            fontSize={'sm'}
            {...restProps.propsConfigs?.triggerBtnProps}
          >
            {intVal}
          </Button>
        </PopoverTrigger>
      ) : null}
      {!children && restProps.triggerVariant === 'input' ? (
        <Flex position="relative" alignItems={'center'}>
          <PopoverAnchor>
            <Input
              id={id}
              onKeyPress={(e) => {
                if (e.key === ' ' && !open) {
                  e.preventDefault()
                  setOpen(true)
                }
              }}
              autoComplete="off"
              width={'16rem'}
              paddingRight={'2.5rem'}
              disabled={disabled}
              name={name}
              value={intVal}
              onChange={(e) => e.target.value}
              {...restProps.propsConfigs?.inputProps}
            />
          </PopoverAnchor>
          <PopoverTrigger asChild>
            <Button
              position="absolute"
              variant={'ghost'}
              right="0"
              size="sm"
              marginRight="5px"
              zIndex={1}
              type="button"
              disabled={disabled}
              padding={'8px'}
              {...restProps.propsConfigs?.triggerIconBtnProps}
            >
              {Icon}
            </Button>
          </PopoverTrigger>
        </Flex>
      ) : null}
      {children ? children(selectedDates) : null}
      <PopoverContentWrapper
        {...(usePortal ? { containerRef: portalRef } : {})}
      >
        <PopoverContent
          width="100%"
          {...restProps.propsConfigs?.popoverCompProps?.popoverContentProps}
          portalled={false}
        >
          <PopoverBody
            {...restProps.propsConfigs?.popoverCompProps?.popoverBodyProps}
          >
            <FocusLock
              shards={[
                ...(usePortal ? [portalRef as RefObject<HTMLDivElement>] : []),
              ]}
            >
              <RangeCalendarPanel
                dayzedHookProps={{
                  monthsToDisplay: datepickerConfigs.monthsToDisplay,
                  onDateSelected: handleOnDateSelected,
                  selected: selectedDates,
                  date: dateInView,
                  minDate: minDate,
                  maxDate: maxDate,
                  offset: offset,
                  onOffsetChanged: setOffset,
                  firstDayOfWeek: datepickerConfigs.firstDayOfWeek,
                }}
                configs={datepickerConfigs}
                propsConfigs={restProps.propsConfigs}
                selected={selectedDates}
              />
            </FocusLock>
          </PopoverBody>
        </PopoverContent>
      </PopoverContentWrapper>
    </PopoverRoot>
  )
}
