{ pkgs }: {
  deps = [
    # Your existing dependencies
    pkgs.postgresql
    pkgs.librsvg
    pkgs.giflib
    pkgs.libjpeg
    pkgs.libpng
    pkgs.pango
    pkgs.cairo
    pkgs.libuuid
    pkgs.jq

    # Required for node-gyp to work
    pkgs.python3
    pkgs.gcc
    pkgs.make
    pkgs.nodejs
    pkgs.git
  ];
}
