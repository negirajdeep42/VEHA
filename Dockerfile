# Stage 1: Build Java Application
FROM maven:3.8.5-openjdk-17 AS builder
WORKDIR /app
COPY backend/pom.xml .
# Download dependencies first (cache layer)
RUN mvn dependency:go-offline
COPY backend/src ./src
RUN mvn clean package -DskipTests

# Stage 2: Runtime Container
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=builder /app/target/jewelry-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
