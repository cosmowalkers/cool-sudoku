## ADDED Requirements

### Requirement: Define 18 achievements with unlock conditions
The system SHALL define 18 achievements across 4 categories with programmatic unlock conditions.

#### Scenario: Achievement definitions exist
- **WHEN** achievement system initializes
- **THEN** 18 achievements SHALL be defined: 4 beginner, 6 advanced, 4 streak-based, 4 milestone

### Requirement: Check achievements after game completion
The system SHALL evaluate all locked achievements after each completed game.

#### Scenario: Condition met for locked achievement
- **WHEN** user completes a game and an achievement's condition is satisfied
- **THEN** the achievement SHALL be marked as unlocked with the current date

#### Scenario: Multiple achievements unlocked simultaneously
- **WHEN** completing a game satisfies conditions for 2+ achievements
- **THEN** all qualifying achievements SHALL be unlocked

### Requirement: Show unlock animation
The system SHALL display an animation when an achievement is newly unlocked.

#### Scenario: Single achievement unlocked
- **WHEN** one achievement is newly unlocked
- **THEN** a badge card SHALL appear with: Lottie sparkle background, large emoji icon, achievement name, unlock condition description, and "achievement" sound effect

#### Scenario: Multiple achievements unlocked
- **WHEN** multiple achievements are unlocked in one game
- **THEN** badge cards SHALL appear sequentially with 500ms delay between each

#### Scenario: Dismiss achievement card
- **WHEN** achievement card is showing
- **THEN** it SHALL auto-dismiss after 2 seconds or on user tap

### Requirement: Display achievements page
The system SHALL provide an achievements page showing all 18 badges and their status.

#### Scenario: View achievements
- **WHEN** user navigates to achievements section
- **THEN** a grid SHALL display all 18 achievements: unlocked ones in color with name, locked ones as gray silhouette with "???"

#### Scenario: Progress indicator
- **WHEN** achievements page is displayed
- **THEN** a progress indicator SHALL show "X/18 unlocked" at the top

#### Scenario: Tap unlocked achievement
- **WHEN** user taps an unlocked achievement
- **THEN** details SHALL show: name, description, unlock date

### Requirement: Persist achievement state
The system SHALL persist unlocked achievements across app restarts.

#### Scenario: App restart
- **WHEN** user closes and reopens app
- **THEN** all previously unlocked achievements and their dates SHALL be preserved
