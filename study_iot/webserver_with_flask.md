---
sort: 5
---

# CROSS-COMPILE GPROF TO ANALYS C/C++ APP
```shell
#!/bin/bash
wget https://mirror.csclub.uwaterloo.ca/gnu/binutils/binutils-2.33.1.tar.xz
wget https://releases.linaro.org/components/toolchain/binaries/7.5-2019.12/aarch64-linux-gnu/gcc-linaro-7.5.0-2019.12-i686_aarch64-linux-gnu.tar.xz
tar Jxf binutils-2.33.1.tar.xz
tar Jxf aarch64-linux-gnu/gcc-linaro-7.5.0-2019.12-i686_aarch64-linux-gnu.tar.xz
export CROSS_COMPILE=$(pwd)/gcc-linaro-7.5.0-2019.12-i686_aarch64-linux-gnu/bin/aarch64-linux-gnu-
export PREFIX=$(pwd)/binutils-2.33.1-aarch64-linux-gnu
mkdir binutils
cd binutils
../binutils-2.33.1/configure --host=aarch64-linux-gnu --with-static-standard-libraries --program-prefix=aarch64-linux-gnu- --prefix=${PREFIX}
make all install
cd -
```
























