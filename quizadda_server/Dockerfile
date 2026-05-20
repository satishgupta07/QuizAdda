# syntax=docker/dockerfile:1.6

# ============================================================
# Stage 1 — Build the JAR with the Maven Wrapper.
# Using the JDK image so we have javac; the result is just the
# packaged JAR which is copied into the lean runtime image below.
# ============================================================
FROM eclipse-temurin:17-jdk-jammy AS build
WORKDIR /workspace

# Copy only the files needed to resolve dependencies first so this
# layer is reused as long as pom.xml is unchanged.
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
RUN chmod +x mvnw && ./mvnw -q -B -DskipTests dependency:go-offline

# Now bring in the sources and build.
COPY src src
RUN ./mvnw -q -B -DskipTests package \
    && cp target/*.jar app.jar

# ============================================================
# Stage 2 — Minimal runtime image.
# Temurin JRE is ~150 MB; pairs well with Render's free dyno limits.
# ============================================================
FROM eclipse-temurin:17-jre-jammy AS runtime
WORKDIR /app

# Create an unprivileged user so the JVM doesn't run as root.
RUN groupadd --system --gid 1001 spring \
    && useradd  --system --uid 1001 --gid spring --home /app spring \
    && mkdir -p /app/uploads \
    && chown -R spring:spring /app
USER spring:spring

COPY --from=build --chown=spring:spring /workspace/app.jar app.jar

# Render injects PORT. Defaults to 9797 for local docker runs.
ENV PORT=9797 \
    JAVA_OPTS=""
EXPOSE 9797

# Let the JVM read the container's memory cap and size the heap to ~75%.
# Avoids manual -Xmx fiddling per environment.
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -XX:MaxRAMPercentage=75 -Djava.security.egd=file:/dev/./urandom -jar /app/app.jar"]
