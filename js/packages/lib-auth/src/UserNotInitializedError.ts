export class UserNotInitializedError extends Error {
  constructor() {
    super("User not initialized");
  }
}
