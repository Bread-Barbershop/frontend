/**
 * @jest-environment node
 */

jest.mock('@sentry/nextjs', () => ({
  withScope: jest.fn((callback: CallableFunction) =>
    callback({
      setTag: jest.fn(),
      setContext: jest.fn(),
    })
  ),
  captureException: jest.fn(),
}));

import * as Sentry from '@sentry/nextjs';

import { captureDriveError } from './captureDriveError';

describe('captureDriveError', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('예상 가능한 4xx 응답은 Sentry에 기록하지 않는다', () => {
    captureDriveError({
      error: new Error('Drive request failed: 403'),
      operation: 'drive_save_prepare',
    });

    expect(Sentry.captureException).not.toHaveBeenCalled();
  });

  it('5xx 응답은 Drive 작업명과 상태 코드로 Sentry에 기록한다', () => {
    const scope = {
      setTag: jest.fn(),
      setContext: jest.fn(),
    };
    (Sentry.withScope as jest.Mock).mockImplementation(
      (callback: CallableFunction) => callback(scope)
    );

    const error = Object.assign(new Error('Drive unavailable'), { status: 503 });
    captureDriveError({
      error,
      operation: 'drive_save_prepare',
    });

    expect(Sentry.captureException).toHaveBeenCalledWith(error);
    expect(scope.setTag).toHaveBeenCalledWith('operation', 'drive_save_prepare');
    expect(scope.setTag).toHaveBeenCalledWith('error_source', 'google_drive');
    expect(scope.setContext).toHaveBeenCalledWith(
      'drive_operation',
      expect.objectContaining({ httpStatus: 503 })
    );
  });
});
