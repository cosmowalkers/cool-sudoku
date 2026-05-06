## ADDED Requirements

### Requirement: Number placement animation
The system SHALL animate numbers appearing in cells with a spring bounce effect when placed.

#### Scenario: Place number in cell
- **WHEN** user places a number (or hint reveals a number)
- **THEN** the number SHALL appear with scale 0.6→1.0 + opacity 0→1 using spring animation (~150ms)

#### Scenario: Reduced motion enabled
- **WHEN** system reduced-motion is enabled and user places a number
- **THEN** the number SHALL appear instantly without animation

### Requirement: Error shake animation
The system SHALL shake the cell horizontally when an incorrect number is placed.

#### Scenario: Place wrong number
- **WHEN** user places a number that conflicts with the solution
- **THEN** the cell SHALL shake horizontally (±4px, 3 cycles, 200ms total)

### Requirement: Line/box completion flash
The system SHALL flash-highlight a row, column, or 3×3 box when it becomes fully and correctly filled.

#### Scenario: Complete a row
- **WHEN** user fills the last empty cell in a row and all 9 values are unique
- **THEN** all 9 cells in that row SHALL flash with an opacity pulse (0→0.3→0, 300ms)

#### Scenario: Complete multiple groups simultaneously
- **WHEN** placing a number completes both a row and a column
- **THEN** both groups SHALL flash simultaneously

### Requirement: Number pad press animation
The system SHALL animate number pad buttons with scale feedback on press.

#### Scenario: Press number button
- **WHEN** user presses a number pad button
- **THEN** the button SHALL scale to 0.9 with spring animation, then bounce back to 1.0 on release

### Requirement: Selected cell pulse
The system SHALL show a subtle pulse animation on the currently selected cell's border.

#### Scenario: Cell is selected
- **WHEN** a cell is selected
- **THEN** its highlight border opacity SHALL cycle between 0.6 and 1.0 (1.5s period, repeating)

#### Scenario: Cell deselected or reduced motion
- **WHEN** another cell is selected OR reduced-motion is enabled
- **THEN** the pulse animation SHALL stop immediately
