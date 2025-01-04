import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  Flex,
  Input,
  InputProps,
  PopoverOpenChangeDetails,
  Portal,
} from '@chakra-ui/react'
import FocusLock from 'react-focus-lock'
import { Month_Names_Short, Weekday_Names_Short } from './utils/calanderUtils'
import { CalendarPanel } from './components/CalendarPanel'
import {
  DatepickerConfigs,
  DatepickerProps,
  OnDateSelected,
  PropsConfigs,
} from './utils/types'
import { CalendarIcon } from './components/CalendarIcon'
import { Button, ButtonProps } from './components/snippets/button'
import {
  PopoverAnchor,
  PopoverBody,
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
} from './components/snippets/popover'
import dayjs, { Dayjs, isDayjs } from 'dayjs'

interface SingleProps extends DatepickerProps {
  date?: Dayjs
  onDateChange: (date: Dayjs) => void
  configs?: DatepickerConfigs
  disabled?: boolean
  /**
   * disabledDates: `Uses startOfDay as comparison`
   */
  disabledDates?: Set<number>
  children?: (value: Dayjs | undefined) => React.ReactNode
  defaultIsOpen?: boolean
  closeOnSelect?: boolean
  id?: string
  name?: string
  usePortal?: boolean
  portalRef?: React.MutableRefObject<null>
}

export type VariantProps =
  | {
      triggerVariant?: 'default'
      propsConfigs?: PropsConfigs
    }
  | {
      triggerVariant: 'input'
      triggerIcon?: React.ReactNode
      propsConfigs?: Omit<PropsConfigs, 'triggerBtnProps'> & {
        inputProps?: InputProps
        triggerIconBtnProps?: ButtonProps
      }
    }

export type SingleDatepickerProps = SingleProps & VariantProps

const DefaultConfigs: Required<DatepickerConfigs> = {
  dateFormat: 'YYYY-MM-DD',
  monthNames: Month_Names_Short,
  dayNames: Weekday_Names_Short,
  firstDayOfWeek: 0,
  monthsToDisplay: 1,
}

export const SingleDatepicker: React.FC<SingleDatepickerProps> = ({
  date: selectedDate,
  name,
  disabled,
  onDateChange,
  id: _id,
  minDate,
  maxDate,
  configs,
  usePortal,
  portalRef,
  disabledDates,
  defaultIsOpen = false,
  closeOnSelect = true,
  children,
  ...restProps
}) => {
  const randomId = useId()
  const [dateInView, setDateInView] = useState(selectedDate)
  const [offset, setOffset] = useState(0)
  const internalUpdate = useRef(false)
  const [open, setOpen] = useState(defaultIsOpen)
  const id = _id || randomId

  const onClose = useCallback(() => {
    setOpen(false)
  }, [])

  const Icon =
    restProps.triggerVariant === 'input'
      ? (restProps?.triggerIcon ?? <CalendarIcon />)
      : null

  const datepickerConfigs = useMemo(
    () => ({
      ...DefaultConfigs,
      ...configs,
    }),
    [configs],
  )

  const [tempInput, setInputVal] = useState(
    selectedDate ? selectedDate.format(datepickerConfigs.dateFormat) : '',
  )

  const onPopoverClose = useCallback(() => {
    onClose()
    setDateInView(selectedDate)
    setOffset(0)
  }, [onClose, selectedDate])

  const onOpenChange = useCallback(
    (openDetails: PopoverOpenChangeDetails) => {
      setOpen(openDetails.open)
      if (!openDetails.open) {
        onPopoverClose()
      }
    },
    [onPopoverClose],
  )

  // dayzed utils
  const handleOnDateSelected: OnDateSelected = useCallback(
    ({ selectable, date }) => {
      if (!selectable) return
      if (isDayjs(date)) {
        internalUpdate.current = true
        onDateChange(date)
        setInputVal(date ? date.format(datepickerConfigs.dateFormat) : '')
        if (closeOnSelect) onClose()
        return
      }
    },
    [closeOnSelect, datepickerConfigs.dateFormat, onClose, onDateChange],
  )

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      internalUpdate.current = true
      setInputVal(event.target.value)
      const newDate = dayjs(event.target.value, datepickerConfigs.dateFormat)
      if (!isDayjs(newDate)) {
        return
      }
      const isDisabled = disabledDates?.has(newDate.startOf('date').unix())
      if (isDisabled) return
      onDateChange(newDate)
      setDateInView(newDate)
    },
    [datepickerConfigs.dateFormat, disabledDates, onDateChange],
  )

  const PopoverContentWrapper = usePortal ? Portal : React.Fragment

  useEffect(() => {
    if (internalUpdate.current) {
      internalUpdate.current = false
      return
    }
    setInputVal(
      typeof selectedDate !== 'undefined'
        ? selectedDate.format(datepickerConfigs.dateFormat)
        : '',
    )
    setDateInView(selectedDate)
  }, [datepickerConfigs.dateFormat, selectedDate])

  return (
    <PopoverRoot
      id={id}
      positioning={{
        placement: 'bottom-start',
      }}
      open={open}
      onOpenChange={onOpenChange}
      lazyMount
      {...restProps.propsConfigs?.popoverCompProps?.popoverRootProps}
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
            {selectedDate
              ? selectedDate.format(datepickerConfigs.dateFormat)
              : ''}
          </Button>
        </PopoverTrigger>
      ) : null}
      {!children && restProps.triggerVariant === 'input' ? (
        <Flex
          position="relative"
          alignItems="center"
          {...restProps.propsConfigs?.inputWrapProps}
        >
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
              width={'10rem'}
              disabled={disabled}
              name={name}
              value={tempInput}
              onChange={handleInputChange}
              paddingRight={'2.5rem'}
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
      {children ? children(selectedDate) : null}
      <PopoverContentWrapper
        {...(usePortal ? { containerRef: portalRef } : {})}
      >
        <PopoverContent
          w="100%"
          {...restProps.propsConfigs?.popoverCompProps?.popoverContentProps}
          portalled={false}
        >
          <PopoverBody
            {...restProps.propsConfigs?.popoverCompProps?.popoverBodyProps}
          >
            <FocusLock>
              <CalendarPanel
                dayzedHookProps={{
                  showOutsideDays: true,
                  monthsToDisplay: datepickerConfigs.monthsToDisplay,
                  onDateSelected: handleOnDateSelected,
                  selected: selectedDate,
                  date: dateInView,
                  minDate: minDate,
                  maxDate: maxDate,
                  offset: offset,
                  onOffsetChanged: setOffset,
                  firstDayOfWeek: datepickerConfigs.firstDayOfWeek,
                }}
                configs={datepickerConfigs}
                propsConfigs={restProps.propsConfigs}
                disabledDates={disabledDates}
              />
            </FocusLock>
          </PopoverBody>
        </PopoverContent>
      </PopoverContentWrapper>
    </PopoverRoot>
  )
}
