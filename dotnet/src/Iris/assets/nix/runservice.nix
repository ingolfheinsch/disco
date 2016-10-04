with import <nixpkgs> {};

{
  fsiEnv =  stdenv.mkDerivation {
    name = "fsiEnv";
    buildInputs = [ stdenv curl openssl ];
    libpath="${curl}/lib:${openssl}/lib:";
    shellHook = ''
      export LD_LIBRARY_PATH="$libpath":$LD_LIBRARY_PATH
    '';
  };
}
