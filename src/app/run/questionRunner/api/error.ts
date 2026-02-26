export class QuestionRunnerApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "QuestionRunnerApiError";
    this.status = status;
  }
}
