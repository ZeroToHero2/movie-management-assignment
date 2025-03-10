import { ERRORS } from './messages';
import { HttpStatus } from '@nestjs/common';
import { BaseError } from '@application/common/error';

export class UnknownError extends BaseError {
  constructor() {
    super(ERRORS.UNKNOWN, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export class RateLimitExceedError extends BaseError {
  constructor() {
    super(ERRORS.RATE_LIMIT_EXCEEDED, HttpStatus.TOO_MANY_REQUESTS);
  }
}

export class UnauthorizedError extends BaseError {
  constructor() {
    super(ERRORS.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
  }
}

export class ForbiddenError extends BaseError {
  constructor() {
    super(ERRORS.FORBIDDEN, HttpStatus.FORBIDDEN);
  }
}

export class UserAlreadyExistsError extends BaseError {
  constructor() {
    super(ERRORS.USER_ALREADY_EXISTS, HttpStatus.CONFLICT);
  }
}

export class UserNotFoundError extends BaseError {
  constructor() {
    super(ERRORS.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
  }
}

export class MovieNotFoundError extends BaseError {
  constructor() {
    super(ERRORS.MOVIE_NOT_FOUND, HttpStatus.NOT_FOUND);
  }
}

export class MovieAlreadyExistsError extends BaseError {
  constructor() {
    super(ERRORS.MOVIE_ALREADY_EXISTS, HttpStatus.CONFLICT);
  }
}

export class MovieNotAvailableError extends BaseError {
  constructor() {
    super(ERRORS.MOVIE_NOT_AVAILABLE, HttpStatus.NOT_FOUND);
  }
}

export class SessionNotFoundError extends BaseError {
  constructor() {
    super(ERRORS.SESSION_NOT_FOUND, HttpStatus.NOT_FOUND);
  }
}

export class SessionAlreadyExistsError extends BaseError {
  constructor() {
    super(ERRORS.SESSION_ALREADY_EXISTS, HttpStatus.CONFLICT);
  }
}

export class UserNotOldEnoughError extends BaseError {
  constructor() {
    super(ERRORS.USER_NOT_OLD_ENOUGH, HttpStatus.BAD_REQUEST);
  }
}

export class TicketAlreadyExistsError extends BaseError {
  constructor() {
    super(ERRORS.TICKET_ALREADY_EXISTS, HttpStatus.CONFLICT);
  }
}

export class TicketNotFoundError extends BaseError {
  constructor() {
    super(ERRORS.TICKET_NOT_FOUND, HttpStatus.NOT_FOUND);
  }
}

export class TicketAlreadyUsedError extends BaseError {
  constructor() {
    super(ERRORS.TICKET_ALREADY_USED, HttpStatus.CONFLICT);
  }
}

export class UserNotAuthorizedError extends BaseError {
  constructor() {
    super(ERRORS.USER_NOT_AUTHORIZED, HttpStatus.BAD_REQUEST);
  }
}

export class ThereAreNoMoviesError extends BaseError {
  constructor() {
    super(ERRORS.THERE_ARE_NO_MOVIES, HttpStatus.NOT_FOUND);
  }
}

export class MovieIsNotActiveError extends BaseError {
  constructor() {
    super(ERRORS.MOVIE_IS_NOT_ACTIVE, HttpStatus.NOT_FOUND);
  }
}

export class TicketDoesNotBelongToUserError extends BaseError {
  constructor() {
    super(ERRORS.TICKET_DOES_NOT_BELONG_TO_USER, HttpStatus.FORBIDDEN);
  }
}

export class SessionAlreadyPassedError extends BaseError {
  constructor() {
    super(ERRORS.SESSION_ALREADY_PASSED, HttpStatus.BAD_REQUEST);
  }
}

export class MovieHasNoSessionsToDelete extends BaseError {
  constructor() {
    super(ERRORS.MOVIE_HAS_NO_SESSIONS_TO_DELETE, HttpStatus.NOT_FOUND);
  }
}

export default ERRORS;
