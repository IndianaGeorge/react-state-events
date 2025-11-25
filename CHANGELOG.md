# Changelog

## [5.0.0] - 2025-11-24

### Changed

- Migrated from React 18 to React 19

### Removed

- Internal properties and methods became private (deprecated in 4.2.0)
- Removed ExternalStateEvents (deprecated in 4.1.0)

## [4.2.0] - 2025-11-24

### Added

- Deprecation notices for properties that should have been private
- Fixed type syntax

## [4.1.0] - 2025-09-28

### Added

- A proper changelog
- MessageStateEvents: a replacement for ExternalStateEvents, with support for adding and removing target windows.
- ExternalStateEvents marked as deprecated, to be removed in the next major update (5.x.x).
- debugAnnounce, debugAddListener, debugRemoveListener, debugSend: debug helpers to connect your own StateEvent classes to the debug tool

### Changed

- LocalStateEvents now uses the debug helpers to connect to the debugger.
- LocalStateEvents only connects to the debugger on subscribe, instead of on instancing, when there's no previous subscribers.
- LocalStateEvents now unsubscribing via debugRemoveListener when no suscribers remain.

### Removed

- None
