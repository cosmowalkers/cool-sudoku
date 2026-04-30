## ADDED Requirements

### Requirement: Display 9×9 grid with 3×3 box borders
The system SHALL render a 9×9 sudoku grid with visually distinct borders separating the nine 3×3 boxes.

#### Scenario: Initial render
- **WHEN** game board component mounts with a puzzle
- **THEN** it SHALL display 81 cells in a 9×9 grid with thick borders between 3×3 boxes and thin borders between individual cells

### Requirement: Select cell on tap
The system SHALL allow user to select a cell by tapping it, highlighting the selected cell.

#### Scenario: Tap empty cell
- **WHEN** user taps an empty cell
- **THEN** the cell SHALL become selected with a distinct highlight color

#### Scenario: Tap given cell
- **WHEN** user taps a cell that contains a given (pre-filled) number
- **THEN** the cell SHALL become selected but remain non-editable

#### Scenario: Tap already selected cell
- **WHEN** user taps the currently selected cell again
- **THEN** the cell SHALL remain selected (no deselection on re-tap)

#### Scenario: Tap outside board
- **WHEN** user taps an area outside the board grid (e.g., background or controls area)
- **THEN** the current cell selection SHALL be preserved (not cleared)

### Requirement: Highlight related cells
The system SHALL highlight cells in the same row, column, and 3×3 box as the selected cell.

#### Scenario: Select a cell
- **WHEN** user selects cell at row 3, column 5
- **THEN** all cells in row 3, column 5, and the containing 3×3 box SHALL be highlighted with a subtle background color

### Requirement: Highlight same numbers
The system SHALL highlight all cells containing the same number as the selected cell.

#### Scenario: Select cell with number 7
- **WHEN** user selects a cell containing number 7
- **THEN** all other cells containing 7 SHALL be highlighted with a matching-number indicator

### Requirement: Show conflict indicators
The system SHALL visually indicate cells that conflict with each other (same number in row/column/box).

#### Scenario: Place conflicting number
- **WHEN** user places a number that conflicts with another cell in the same row/column/box
- **THEN** both conflicting cells SHALL display an error indicator (red text or background)

### Requirement: Display notes in cells
The system SHALL display pencil-mark notes (small numbers) in cells when notes have been entered.

#### Scenario: Cell has notes
- **WHEN** a cell has notes [1, 3, 7] entered
- **THEN** the cell SHALL display these numbers as small text in a grid layout within the cell

### Requirement: Distinguish given vs user-entered numbers
The system SHALL visually distinguish pre-filled (given) numbers from user-entered numbers.

#### Scenario: Render mixed board
- **WHEN** board contains both given and user-entered numbers
- **THEN** given numbers SHALL appear in a bold/dark style and user numbers in a lighter/colored style
