# Changelog

## [4.2.0] - 2025-09-28

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
