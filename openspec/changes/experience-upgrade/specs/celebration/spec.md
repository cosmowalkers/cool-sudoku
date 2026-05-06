## ADDED Requirements

### Requirement: Confetti animation on completion
The system SHALL play a full-screen confetti animation when the puzzle is completed.

#### Scenario: Complete puzzle
- **WHEN** user fills the last cell correctly and puzzle is complete
- **THEN** a Lottie confetti animation SHALL play full-screen for 2-3 seconds

#### Scenario: Reduced motion enabled
- **WHEN** reduced-motion is enabled and puzzle is complete
- **THEN** confetti animation SHALL be skipped, proceeding directly to the result card

### Requirement: Result card display
The system SHALL show a result card after the celebration animation with game statistics.

#### Scenario: Display result card
- **WHEN** confetti animation finishes (or is skipped)
- **THEN** a result card SHALL slide in from bottom (300ms) showing: difficulty, elapsed time, mistakes, hints used

#### Scenario: New personal best
- **WHEN** the elapsed time is better than the player's previous best for that difficulty
- **THEN** the result card SHALL display a "New Record!" highlight indicator

### Requirement: Share result
The system SHALL allow users to share their result as an image.

#### Scenario: Tap share button
- **WHEN** user taps the "Share" button on the result card
- **THEN** the system SHALL capture the result card as an image and open the system share sheet

### Requirement: Post-celebration flow
The system SHALL provide a "New Game" button on the result card to start another game.

#### Scenario: Tap new game after completion
- **WHEN** user taps "New Game" on the result card
- **THEN** the system SHALL navigate to the difficulty selection screen
