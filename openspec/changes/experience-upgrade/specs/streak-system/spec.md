## ADDED Requirements

### Requirement: Track daily streak
The system SHALL track consecutive days where the user completed at least one puzzle.

#### Scenario: Complete first game of the day
- **WHEN** user completes a puzzle and lastCompletedDate is yesterday
- **THEN** currentStreak SHALL increment by 1

#### Scenario: Complete game same day
- **WHEN** user completes a puzzle and lastCompletedDate is today
- **THEN** currentStreak SHALL remain unchanged (already counted today)

#### Scenario: Streak broken
- **WHEN** user completes a puzzle and lastCompletedDate is more than 1 day ago
- **THEN** currentStreak SHALL reset to 1

#### Scenario: Track best streak
- **WHEN** currentStreak exceeds bestStreak
- **THEN** bestStreak SHALL be updated to currentStreak

### Requirement: Display streak in game screen
The system SHALL show the current streak with a flame icon in the game screen header.

#### Scenario: Today already completed
- **WHEN** user has completed a game today
- **THEN** an orange flame icon with streak number SHALL display in the header

#### Scenario: Today not yet completed
- **WHEN** user has not completed a game today but has an active streak
- **THEN** a gray flame icon with streak number SHALL display in the header

#### Scenario: No streak
- **WHEN** currentStreak is 0
- **THEN** no flame icon SHALL be shown

### Requirement: Streak milestone celebration
The system SHALL celebrate when streak reaches milestone numbers.

#### Scenario: Reach 7-day streak
- **WHEN** user completes a game and currentStreak becomes 7
- **THEN** a milestone celebration overlay SHALL appear with Lottie animation and congratulatory text

#### Scenario: Milestone thresholds
- **WHEN** currentStreak reaches 3, 7, 14, 30, or 100
- **THEN** each milestone SHALL trigger a unique celebration

### Requirement: Persist streak data
The system SHALL persist streak data across app restarts.

#### Scenario: App restart
- **WHEN** user closes and reopens the app
- **THEN** currentStreak, bestStreak, and lastCompletedDate SHALL be preserved
