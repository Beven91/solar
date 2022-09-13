
import { GeneralResult } from '$projectName$-api-core';
import { ControllerAdvice, ExceptionHandler } from 'node-web-mvc';

@ControllerAdvice
export default class GlobalErrorHandler {
  @ExceptionHandler
  handleException(ex) {
    return JSON.stringify(GeneralResult.fail(99, ex.message));
  }
}