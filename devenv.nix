{ pkgs, lib, config, ... }:

{
  packages = with pkgs; [
    git
    gnumake
    sqlite
    sops
    age
  ];

  languages.javascript = {
    enable = true;
    package = pkgs.nodejs_24;
    pnpm.enable = true;
  };

  languages.go = {
    enable = true;
    version = "1.26";
  };

  env = {
    HOST = "localhost";
    PORT = "3001";
    GIN_MODE = "debug";
    ALLOWED_ORIGINS = "*";
    ANILIST_API_URL = "https://graphql.anilist.co";
    RATING_TYPE = "stars";
  };

  dotenv.enable = true;
  dotenv.filename = [
    ".env.local"
    "backend/.env"
  ];

  processes = {
    frontend.exec = "pnpm run dev:plain";
    backend.exec = "bash -c 'cd backend && go run ./cmd/server/main.go'";
  };

  tasks = {
    "dev:install" = {
      description = "Install JS + Go dependencies";
      exec = "pnpm install && bash -c 'cd backend && go mod download'";
    };
    "dev:doctor" = {
      description = "Check the five-tool setup";
      exec = "bash ./scripts/doctor.sh";
    };
  };

  enterShell = ''
    echo "AniRyu devenv ready (node $(node --version), go $(go version | cut -d' ' -f3))."
    echo "  devenv up                  # localhost:5173 + localhost:3001"
    echo "  mise run dev:named          # https://aniryu.localhost + https://api.aniryu.localhost (needs: portless trust)"
    echo "  ./scripts/sops-decrypt.sh  # decrypt secrets once you have the age key"
  '';
}
