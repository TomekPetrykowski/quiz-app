# Microservices Project Requirements

The project consists of two independent stages. Each stage is evaluated separately (max. 50 base points + max. 10 bonus points) and constitutes 50% of the final grade. To pass the project, at least 25 base points must be earned in each stage.

## General Requirements for Project Scope:

### Microservices Application:
You must implement an application based on microservices architecture, consisting of at least three distinct, logically justified services (microservices). Example components:

- Frontend service
- Backend service (API)
- Dedicated service (e.g., business logic handler)
- Database (SQL/NoSQL)
- Cache (e.g., Redis)
- Queue system (e.g., RabbitMQ)

Technology choices are flexible. Proper communication between services must be ensured (e.g., REST, gRPC, message queue communication).

---

## Stage I: Deployment Using Docker Compose (50% of Final Grade)

**Goal:** Configure and run the entire microservice application locally using Docker Compose, emphasizing best containerization practices.

- **Maximum base points:** 50 pts
- **Minimum to pass Stage I:** 25 pts

### Required Elements and Scoring:

- **Architecture Quality (based on implementation):** (8 pts)
  - Evaluation of logical division into microservices, consistency, and correct inter-service communication.

- **Service Definition (docker-compose.yml):** (14 pts)
  - Correct syntax in docker-compose.yml
  - Define all application services and dependencies (`depends_on`)
  - Effective configuration management (e.g., environment variables)

- **Docker Networks:** (6 pts)
  - Use of a custom Docker network
  - Proper configuration for container name-based communication

- **Docker Volumes:** (6 pts)
  - Configure volumes for stateful services to ensure data persistence

- **Docker Image Optimization (Dockerfile):** (11 pts)
  - Proper custom Dockerfiles
  - Use of image size minimization techniques (e.g., multi-stage builds)
  - Effective use of layer caching and .dockerignore

- **Multi-platform Support:** (5 pts)
  - Build multi-architecture images (amd64, arm64) using docker buildx or similar

### Bonus Topics (Stage I - up to 10 extra points):

- Implement `healthcheck` directives in docker-compose.yml (+4 pts)
- Use build arguments (`ARG`) and environment variables (`ENV`) in Dockerfile for parameterization (+1 pt)
- Use Docker Secrets for managing sensitive data (+3 pts)
- Implement live/hot reload mechanisms for development services (+2 pts)

---

## Stage II: Migration to Kubernetes (50% of Final Grade)

**Goal:** Migrate the same microservices application to Kubernetes, configure resources, and ensure scalability and availability.

- **Maximum base points:** 50 pts
- **Minimum to pass Stage II:** 25 pts

### Required Elements and Scoring:

- **Kubernetes Resource Manifests (Deployment, Service, ConfigMap, Secret):** (19 pts)
  - Proper YAML manifests
  - Correct configuration of selectors, labels, ports
  - Secure configuration and secret management

- **Persistent Data Storage (PV/PVC):** (9 pts)
  - Proper PersistentVolumeClaim definition
  - Use StorageClass (if available) or define PersistentVolume
  - Correct volume mounting in Pods

- **External Traffic (Ingress / LoadBalancer):** (9 pts)
  - Configure external access via Ingress or LoadBalancer Service
  - Correct routing rules or port exposure

- **Application Scaling (Replicas + HPA):** (13 pts)
  - Set appropriate number of replicas in Deployment
  - Configure working HorizontalPodAutoscaler (HPA) for at least one service (requires Metrics Server)

### Bonus Topics (Stage II - up to 10 extra points):

- **Monitoring:** Implement Prometheus + Grafana, configure ServiceMonitor/annotations, create a basic dashboard (+4 pts)
- **Helm:** Package the application as a Helm Chart (+3 pts)
- **CI/CD:** Implement a simple CI/CD pipeline (e.g., GitHub Actions) for automatic image builds and pushes to a container registry (+3 pts)

---

## General Evaluation Criteria:

- **Functionality:** Correct application operation in both environments
- **Completeness:** Completion of all required base elements
- **Code and Configuration Quality:** Correctness and best practice adherence for Dockerfiles, docker-compose.yml, Kubernetes manifests
- **Stage Completion:** Minimum of 25 base points required from **Stage I** AND **Stage II** to pass
- **Final Grade:** Arithmetic average of the percentage score (base + bonus, max. 60 pts per stage) from both stages