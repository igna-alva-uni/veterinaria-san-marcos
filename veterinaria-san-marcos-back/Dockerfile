FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /backend
COPY . .
ARG APP_MODULE
RUN --mount=type=cache,target=/root/.m2,sharing=locked \
    mvn -B -pl "${APP_MODULE}" -am -DskipTests package && \
    cp "${APP_MODULE}"/target/*.jar /app.jar

FROM eclipse-temurin:21-jre
COPY --from=build /app.jar /app.jar
USER 10001
ENTRYPOINT ["java", "-jar", "/app.jar"]
