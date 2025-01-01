# A Simple Chakra Datepicker based on Dayjs.

[![npm version](https://badge.fury.io/js/chakra-dayjs-datepicker.svg)](https://badge.fury.io/js/chakra-dayjs-datepicker) ![Downloads](https://img.shields.io/npm/dm/chakra-dayjs-datepicker.svg)


Every individual component is using Chakra UI. So it should respect all [Chakra UI](https://github.com/chakra-ui/chakra-ui) Configs without problem.

Based on [chakra-dayzed-datepicker](https://github.com/aboveyunhai/chakra-dayzed-datepicker), we are experimentally supporting Chakra-UI v3(beta).

<img src="https://user-images.githubusercontent.com/35160613/141594524-35a0c536-d9fd-4528-bd56-f647b98755be.gif" height="50%"/>
<img src="https://user-images.githubusercontent.com/35160613/141594549-31f55369-6e0e-4818-9351-6f515e3f1f84.gif" height="50%"/>

The component itself has to use some `date` library

Highly recommend just copy/paste the source code from `/src` to customize however you want.

## Install the dependency
Npm
```
npm i dayjs
```
```
npm i chakra-dayjs-datepicker
```

Yarn:
```
yarn add dayjs
```
```
yarn add chakra-dayjs-datepicker
```

## Basic usage
### Single
```jsx

  import { SingleDatepicker } from "chakra-dayjs-datepicker";

  const [date, setDate] = useState(dayjs());
  
  <SingleDatepicker
    name="date-input"
    date={date}
    onDateChange={setDate}
  />

```
### Range:
Note that this list will have one value during the selection process. Your system won't work if you try to control this directly as `[startDate, endDate]` because we'll try to set `selectedDates` to `[intermediateSelection]` and the length of the resulting `selectedDates` is meaningful to the datepicker.
```jsx

  import { RangeDatepicker } from "chakra-dayjs-datepicker";
  
  const [selectedDates, setSelectedDates] = useState<Dayjs[]>([dayjs(), dayjs()]);
  
  <RangeDatepicker
    selectedDates={selectedDates}
    onDateChange={setSelectedDates}
  />
```
### propsConfigs:
`dateNavBtnProps` extends from `ButtonProps` of Chakra-UI
This allows you to override the default behavior however your want as long as supported by Chakra-UI.</br>

```ts
dayOfMonthBtnProps = {
  defaultBtnProps,
  isInRangeBtnProp,
  selectedBtnProps,
  todayBtnProps
}
```
`dayOfMonthBtnProps` allows you to customzie date btn style based on the state. </br>
Style precedence: `default` < `isInRange` < `seleted` < `today`.

`popoverCompProps` might be useful when you want to setup some simple styles like text color globally
```ts
popoverCompProps = {
  popoverContentProps,
  popoverBodyProps
}
```
To sum them up:
```js
  propsConfigs={{
    dateNavBtnProps: {},
    dayOfMonthBtnProps: {
      defaultBtnProps: {},
      isInRangeBtnProps: {},
      selectedBtnProps: {},
      todayBtnProps: {}
    },
    inputProps: {},
    popoverCompProps: {
      popoverContentProps: {},
      popoverBodyProps: {}
    },
    calendarPanelProps: {
      wrapperProps: {},
      contentProps: {},
      headerProps: {},
      dividerProps: {},
    },
    weekdayLabelProps: {},
    dateHeadingProps: {}
  }}
```

<br/>Example:
```js
  propsConfigs={{
    dateNavBtnProps: {
      colorScheme: "blue",
      variant: "outline"
    },
    dayOfMonthBtnProps: {
      defaultBtnProps: {
        borderColor: "red.300",
        _hover: {
          background: 'blue.400',
        }
      },
      isInRangeBtnProps: {
        color: "yellow",
      },
      selectedBtnProps: {
        background: "blue.200",
        color: "green",
      },
      todayBtnProps: {
        background: "teal.400",
      }
    },
    inputProps: {
      size: "sm"
    },
    popoverCompProps: {
      popoverContentProps: {
        background: "gray.700",
        color: "white",
      },
    },
    calendarPanelProps: {
      wrapperProps: {
        borderColor: 'green',
      },
      contentProps: {
        borderWidth: 0,
      },
      headerProps: {
        padding: '5px',
      },
      dividerProps: {
        display: "none",
      },
    },
    weekdayLabelProps: {
      fontWeight: 'normal'
    },
    dateHeadingProps: {
      fontWeight: 'semibold'
    }
  }}
```

### configs:
Non Chakra-related configurations :
```
  configs={{
    dateFormat: 'YYYY-MM-DD',
    dayNames: 'abcdefg'.split(''), // length of 7
    monthNames: 'ABCDEFGHIJKL'.split(''), // length of 12
    firstDayOfWeek: 2, // default is 0, the dayNames[0], which is Sunday if you don't specify your own dayNames,
  }}
```

### other props:

Name                  |single/range  | Type                   | Default value           | Description
----------------------|--------------|------------------------|-------------------------|--------------
name                  |both          | string                 | undefined               | name attribute for `<input />` element
usePortal             |both          | boolean                | undefined               | to prevent parent styles from clipping or hiding content
defaultIsOpen         |both          | boolean                | false                   | open the date panel at the beginning
closeOnSelect         |both          | boolean                | true                    | close the date panel upon the complete selection
minDate               |both          | Date                   | undefined               | minimum date
maxDate               |both          | Date                   | undefined               | maximum date
disabledDates         |single        | Set<number>            | undefined               | for single datepicker only, uses `startOfDay` as comparison, e.g., `  disabledDates={new Set([startOfDay(new Date()).getTime()}`

For version < `npm@0.1.6`:</br>
`dayOfMonthBtnProps` extends from `ButtonProps` and has only `selectedBg` support,
```ts
  dayOfMonthBtnProps: {
    borderColor: "red.300",
    selectedBg: "blue.200",
    _hover: {
      bg: 'blue.400',
    }
  },
```
