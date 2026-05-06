## ADDED Requirements

### Requirement: Play sound on key actions
The system SHALL play short sound effects on key game actions.

#### Scenario: Place number
- **WHEN** user places a number in a cell
- **THEN** a light "pop" sound (~80ms) SHALL play

#### Scenario: Error placement
- **WHEN** user places an incorrect number
- **THEN** a low "bonk" sound (~120ms) SHALL play

#### Scenario: Undo action
- **WHEN** user taps undo
- **THEN** a "whoosh" rewind sound (~100ms) SHALL play

#### Scenario: Line/box clear
- **WHEN** a row, column, or box is completed
- **THEN** an ascending "ding" sound (~200ms) SHALL play

#### Scenario: Puzzle complete
- **WHEN** puzzle is fully solved
- **THEN** a celebratory melody (~800ms) SHALL play

#### Scenario: Achievement unlocked
- **WHEN** an achievement is unlocked
- **THEN** a metallic "clink" sound (~300ms) SHALL play

### Requirement: Preload sounds on app start
The system SHALL preload all sound effects into memory at app launch for instant playback.

#### Scenario: App launches
- **WHEN** app starts
- **THEN** all 6 sound files SHALL be loaded into Audio.Sound instances before game interaction begins

### Requirement: Mute toggle
The system SHALL provide a mute toggle to disable all sound effects.

#### Scenario: Toggle mute on
- **WHEN** user enables mute
- **THEN** no sound effects SHALL play until mute is disabled

#### Scenario: Mute persists across sessions
- **WHEN** user enables mute and restarts the app
- **THEN** mute setting SHALL remain enabled

### Requirement: Respect system silent mode
The system SHALL not play sounds when the device is in silent/vibrate mode.

#### Scenario: Device on silent
- **WHEN** device is in silent mode and user places a number
- **THEN** no sound SHALL play (expo-av handles this automatically)
