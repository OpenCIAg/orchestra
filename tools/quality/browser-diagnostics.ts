import { TestBed } from '@angular/core/testing';

// Angular can report lifecycle errors to the console without failing an assertion.
// Include teardown so a passing fixture cannot leave broken asynchronous work behind.
let errors: jasmine.Spy;
let warnings: jasmine.Spy;
let expectedWarnings: RegExp[] = [];

/** Allow a test to declare a specific warning that is part of the asserted behavior. */
export function expectConsoleWarning(matcher: RegExp): void {
  expectedWarnings.push(matcher);
}

beforeEach(() => {
  expectedWarnings = [];
  errors = spyOn(console, 'error').and.callThrough();
  warnings = spyOn(console, 'warn').and.callThrough();
});
afterEach(() => {
  TestBed.resetTestingModule();
  expect(errors)
    .withContext('No runtime errors, including during teardown')
    .not.toHaveBeenCalled();

  const unexpectedWarnings: unknown[][] = [];
  const unreportedExpectations = [...expectedWarnings];
  for (const args of warnings.calls.allArgs()) {
    const message = args.map((value) => String(value)).join(' ');
    const expectedIndex = unreportedExpectations.findIndex((matcher) =>
      matcher.test(message),
    );
    if (expectedIndex < 0) unexpectedWarnings.push(args);
    else unreportedExpectations.splice(expectedIndex, 1);
  }

  expect(unexpectedWarnings)
    .withContext('No unexpected runtime warnings, including during teardown')
    .toEqual([]);
  expect(unreportedExpectations.map((matcher) => matcher.source))
    .withContext('Every declared expected runtime warning occurred')
    .toEqual([]);
});
