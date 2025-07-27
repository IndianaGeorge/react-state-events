# Changelog

## [4.1.0] - 2025-04-19

### Added

- A proper changelog
- MessageStateEvents: a replacement for ExternalStateEvents, with support for adding and removing target windows. ExternalStateEvents marked as deprecated, to be removed in the next major update (5.x.x).
- debugAnnounce, debugAddListener, debugRemoveListener, debugSend: debug helpers to connect your own StateEvent classes to the debug tool

### Changed

- LocalStateEvents now uses the debug helpers to connect to the debugger.
- LocalStateEvents now unsubscribing via debugRemoveListener when appropriate

### Removed

- None
