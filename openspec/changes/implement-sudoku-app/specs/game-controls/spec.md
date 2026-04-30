## ADDED Requirements

### Requirement: Number input pad
The system SHALL display a number pad with digits 1-9 for entering values into selected cells.

#### Scenario: Tap number when cell selected
- **WHEN** user has selected an empty cell and taps number 5 on the pad
- **THEN** the number 5 SHALL be placed in the selected cell

#### Scenario: Tap number when no cell selected
- **WHEN** no cell is selected and user taps a number
- **THEN** nothing SHALL happen (no crash, no placement)

#### Scenario: Number fully placed
- **WHEN** all 9 instances of a number are correctly placed on the board
- **THEN** that number on the pad SHALL appear disabled/completed

### Requirement: Number overwrites existing value
The system SHALL allow user to directly overwrite an existing user-entered number by inputting a new number, without requiring erase first.

#### Scenario: Overwrite existing user number
- **WHEN** user selects a cell containing user-entered number 3 and taps number 7 on the pad
- **THEN** the cell value SHALL change from 3 to 7, and the previous state SHALL be pushed to undo history

#### Scenario: Overwrite does not double-count mistakes
- **WHEN** user previously placed wrong number 3 (mistake counted) and now overwrites with number 7
- **THEN** if 7 is also wrong, mistake counter SHALL increment by 1 (not re-count the original mistake)

### Requirement: Erase action
The system SHALL provide an erase button to clear the selected cell's user-entered value.

#### Scenario: Erase user-entered cell
- **WHEN** user selects a cell with a user-entered number and taps erase
- **THEN** the cell SHALL be cleared to empty

#### Scenario: Erase given cell
- **WHEN** user selects a given (pre-filled) cell and taps erase
- **THEN** nothing SHALL happen (given cells are immutable)

### Requirement: Notes mode toggle
The system SHALL provide a toggle to switch between normal input mode and notes (pencil-mark) mode.

#### Scenario: Enable notes mode and enter number
- **WHEN** notes mode is active and user taps number 4 on a selected empty cell
- **THEN** the number 4 SHALL be added as a pencil mark in that cell (not as the cell value)

#### Scenario: Toggle off existing note
- **WHEN** notes mode is active and user taps a number that already exists as a note in the selected cell
- **THEN** that note SHALL be removed from the cell

### Requirement: Auto-clear notes on number placement
The system SHALL automatically remove pencil-mark notes from related cells when a number is confirmed in a cell.

#### Scenario: Place number clears notes in same row/column/box
- **WHEN** user places number 5 in a cell
- **THEN** the note "5" SHALL be automatically removed from all cells in the same row, column, and 3×3 box that have it as a pencil mark

### Requirement: Undo action
The system SHALL provide an undo button that reverts the most recent user action.

#### Scenario: Undo number placement
- **WHEN** user places number 8 then taps undo
- **THEN** the cell SHALL revert to its previous state (empty or previous value)

#### Scenario: Undo with no history
- **WHEN** undo stack is empty and user taps undo
- **THEN** nothing SHALL happen (button disabled or no-op)

### Requirement: Hint action
The system SHALL provide a hint button that reveals the correct number for the selected cell.

#### Scenario: Request hint on empty cell
- **WHEN** user selects an empty cell and taps hint
- **THEN** the correct solution number SHALL be placed in the cell, marked as a hint

#### Scenario: Request hint on filled cell
- **WHEN** user selects a cell that already has the correct value and taps hint
- **THEN** nothing SHALL happen

#### Scenario: Hint limit reached
- **WHEN** user has already used 3 hints in the current game and taps hint
- **THEN** nothing SHALL happen and the hint button SHALL appear disabled with "0/3" indicator

### Requirement: Difficulty selection
The system SHALL allow user to select difficulty level when starting a new game.

#### Scenario: Start new game with difficulty
- **WHEN** user selects "Hard" difficulty and confirms
- **THEN** a new puzzle with hard-level difficulty SHALL be generated and displayed
