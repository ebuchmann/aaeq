import React, { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from './components/ui/table'

interface RowData {
  curr: number
  values: number[]
}

const initialData: RowData[] = [
  { curr: 14, values: [5, 5, 6, 7, 8, 10] },
  { curr: 15, values: [5, 5, 6, 7, 9, 11] },
  { curr: 16, values: [5, 5, 6, 7, 9, 12] },
  { curr: 17, values: [5, 6, 7, 8, 10, 13] },
  { curr: 18, values: [5, 6, 7, 9, 11, 14] },
  { curr: 19, values: [6, 6, 8, 9, 12, 16] },
  { curr: 20, values: [6, 7, 8, 10, 13, 17] },
  { curr: 21, values: [6, 7, 9, 11, 14, 19] },
  { curr: 22, values: [6, 8, 10, 12, 16, 22] },
  { curr: 23, values: [7, 8, 10, 13, 18, 24] },
  { curr: 24, values: [7, 9, 11, 15, 20, 27] },
  { curr: 25, values: [8, 10, 13, 16, 22, 30] },
  { curr: 26, values: [9, 11, 14, 18, 25, 34] },
  { curr: 27, values: [9, 12, 15, 20, 28, 38] },
  { curr: 28, values: [10, 13, 17, 23, 31, 43] },
  { curr: 29, values: [11, 14, 19, 25, 35, 49] },
  { curr: 30, values: [12, 16, 21, 29, 40, 55] },
]

const initialHeaderState: string[] = ['1st', '2nd', '3rd', '4th', '5th', '6th']

const TrainingTable: React.FC = () => {
  const [checkedState, setCheckedState] = useState<boolean[][]>(() => {
    const savedState = localStorage.getItem('checkedState')
    return savedState
      ? JSON.parse(savedState)
      : initialData.map((row) => row.values.map(() => false))
  })
  const [headerState] = useState<string[]>(() => {
    const savedState = localStorage.getItem('headerState')
    return savedState ? JSON.parse(savedState) : initialHeaderState
  })

  useEffect(() => {
    localStorage.setItem('checkedState', JSON.stringify(checkedState))
  }, [checkedState])

  const handleCheckboxChange = (rowIndex: number, colIndex: number) => {
    setCheckedState((prevState) => {
      const newState = structuredClone(prevState)
      const isChecked = newState[rowIndex][colIndex]

      if (isChecked) {
        // Uncheck the clicked checkbox and all below it in the same column
        for (let i = rowIndex; i < newState.length; i++) {
          newState[i][colIndex] = false
        }
      } else {
        // Check the clicked checkbox and all above it in the same column
        for (let i = rowIndex; i >= 0; i--) {
          newState[i][colIndex] = true
        }
      }

      return newState
    })
  }

  const columnSums = initialData[0].values.map((_, colIndex) =>
    initialData.reduce(
      (sum, row, rowIndex) =>
        !checkedState[rowIndex][colIndex] ? sum + row.values[colIndex] : sum,
      0
    )
  )

  const totalSum = columnSums.reduce((sum, colSum) => sum + colSum, 0)

  return (
    <div>
      <h2>Training Progress</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Curr</TableHead>
            {initialData[0].values.map((_, index) => (
              <TableHead key={index}>{headerState[index]}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {initialData.map((row, rowIndex) => (
            <TableRow key={row.curr}>
              <TableCell>{row.curr}</TableCell>
              {row.values.map((value, colIndex) => (
                <TableCell key={colIndex}>
                  <label>
                    <input
                      type="checkbox"
                      checked={checkedState[rowIndex][colIndex]}
                      onChange={() => handleCheckboxChange(rowIndex, colIndex)}
                    />
                    {value}
                  </label>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Sum</TableCell>
            {columnSums.map((colSum, index) => (
              <TableCell key={index}>{colSum}</TableCell>
            ))}
            <TableCell>{totalSum}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}

export default TrainingTable
