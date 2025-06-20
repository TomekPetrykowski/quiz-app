# Quizz App - Microservices

Following command will build both for `amd64` and `arm64` platforms:

```bash
docker buildx build --platform linux/amd64,linux/arm64 -t yourname/quiz-frontend ./frontend/quiz_app
```