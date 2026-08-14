#! /bin/sh

mode=$1

source ./emsdk/emsdk_env.sh

cwd=$(pwd)
export PATH="$PATH:$cwd/node_modules/.bin"

if [ "$mode" = "--release" ]; then
  cargo build --release
elif [ "$mode" = "--patch" ]; then
  cargo build \
    --config 'patch."https://github.com/savmlang/sa.git".sasm.path="../bin/sasm"' \
    --config 'patch."https://github.com/savmlang/sa.git".savm.path="../savm"'
else
  cargo build
fi
