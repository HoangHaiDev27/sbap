# Runtime base
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copy csproj files first
COPY VieBook.BE/VieBook.BE/VieBook.BE.csproj VieBook.BE/
COPY VieBook.BE/BusinessObject/BusinessObject.csproj VieBook.BE/BusinessObject/
COPY VieBook.BE/DataAccess/DataAccess.csproj VieBook.BE/DataAccess/
COPY VieBook.BE/DTOs/DTOs.csproj VieBook.BE/DTOs/
COPY VieBook.BE/Repositories/Repositories.csproj VieBook.BE/Repositories/
COPY VieBook.BE/Services/Services.csproj VieBook.BE/Services/

# Restore packages
RUN dotnet restore VieBook.BE/VieBook.BE.csproj

# Copy source code
COPY VieBook.BE/ .

# Build
WORKDIR /src/VieBook.BE
RUN dotnet build VieBook.BE.csproj -c $BUILD_CONFIGURATION -o /app/build

# Publish
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish VieBook.BE.csproj -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# Final runtime
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "VieBook.BE.dll"]
