## ADDED Requirements

### Requirement: Record completed games
The system SHALL record each completed game's result including difficulty, elapsed time, mistakes, and date.

#### Scenario: Game completed
- **WHEN** user successfully completes a puzzle
- **THEN** the result SHALL be persisted to local storage with difficulty, time, mistake count, and completion date

### Requirement: Display statistics per difficulty
The system SHALL display aggregate statistics grouped by difficulty level.

#### Scenario: View stats for hard difficulty
- **WHEN** user navigates to stats page and selects "Hard"
- **THEN** the system SHALL show: games played, best time, average time, and win rate for hard difficulty

### Requirement: Display overall statistics
The system SHALL display overall game statistics across all difficulties.

#### Scenario: View overall stats
- **WHEN** user opens the stats page
- **THEN** the system SHALL show: total games played, total games won, current streak, and best streak

### Requirement: Display recent game history
The system SHALL display a list of recently completed games with their details.

#### Scenario: View history
- **WHEN** user opens the stats page
- **THEN** a list of recent games (up to 100) SHALL be shown with date, difficulty, time, and mistakes for each

### Requirement: Persist statistics across sessions
The system SHALL persist all statistics to local storage so they survive app restarts.

#### Scenario: App restart
- **WHEN** user closes and reopens the app
- **THEN** all previously recorded statistics and history SHALL be available
