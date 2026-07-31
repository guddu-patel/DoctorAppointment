# Prompt — Testing

Add unit tests for the transition table and HTTP integration tests using seed users that prove:
1) valid PENDING→CONFIRMED→CHECKED_IN→COMPLETED persists
2) patient CONFIRMED is 403
3) illegal graph edge is 400
Do not mock away the state machine.
