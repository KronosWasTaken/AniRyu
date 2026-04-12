FROM mcr.microsoft.com/devcontainers/base:ubuntu

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends build-essential \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

USER vscode

RUN mkdir -p /home/vscode/.local/share/pnpm/store \
    && mkdir -p /home/vscode/.cache/go-build \
    && mkdir -p /home/vscode/go/pkg/mod
