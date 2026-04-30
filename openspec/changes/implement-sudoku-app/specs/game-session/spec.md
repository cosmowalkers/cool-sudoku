## ADDED Requirements

### Requirement: Track elapsed time
The system SHALL track elapsed playing time for the current game session, pausing when app is backgrounded.

#### Scenario: Timer runs during play
- **WHEN** game is active and user is playing
- **THEN** a visible timer SHALL increment every second showing MM:SS format

#### Scenario: Timer pauses on background
- **WHEN** app goes to background
- **THEN** timer SHALL pause and resume when app returns to foreground

### Requirement: Pause and resume game
The system SHALL allow user to pause the current game, hiding the board to prevent peeking.

#### Scenario: Pause game
- **WHEN** user taps pause button
- **THEN** timer SHALL stop and board SHALL be hidden behind an overlay

#### Scenario: Resume game
- **WHEN** user taps resume on the pause overlay
- **THEN** timer SHALL resume and board SHALL become visible again

### Requirement: Persist game state
The system SHALL automatically save current game state so it can be restored after app restart.

#### Scenario: App killed and relaunched
- **WHEN** user force-closes the app during a game and reopens it
- **THEN** the previous game state (board, notes, timer, history) SHALL be restored

#### Scenario: No saved game
- **WHEN** app launches with no saved game state
- **THEN** the app SHALL show the new game / difficulty selection screen

### Requirement: Detect game completion
The system SHALL detect when the puzzle is correctly completed and show a completion screen.

#### Scenario: Complete puzzle correctly
- **WHEN** user fills the last empty cell and the board is a valid complete solution
- **THEN** the system SHALL show a congratulations screen with elapsed time and difficulty

### Requirement: Start new game
The system SHALL allow user to abandon current game and start a new one.

#### Scenario: Start new game with game in progress
- **WHEN** user requests new game while a game is in progress
- **THEN** the system SHALL confirm the action before discarding current progress

### Requirement: Track mistakes
The system SHALL track the number of incorrect placements made during a game session.

#### Scenario: Place wrong number
- **WHEN** user places a number that does not match the solution
- **THEN** mistake counter SHALL increment by 1

#### Scenario: Display mistake count
- **WHEN** game is in progress
- **THEN** current mistake count SHALL be visible to the user
