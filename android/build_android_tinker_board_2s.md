---
sort: 2
---

# BUILD ANDROID TINKER BOARD 2S

## 1. Install repo tool on Ubuntu 20.04.5 LTS

### Create folder to get Tinker Board 2S Android source
```shell
mkdir -p ~/android
cd ~/android/
```

### Remove all keyring you has created on your host system
```shell
gpg --delete-key <repo>
gpg --delete-secret-key <repo>
```

### Get repo tool and init source
```shell
wget https://storage.googleapis.com/git-repo-downloads/repo
sudo chmod 777 ./repo
curl -s https://storage.googleapis.com/git-repo-downloads/repo.asc | gpg --verify - ${REPO} && install -m 755 ${REPO} ./repo
export REPO=$(mktemp /tmp/repo.XXXXXXXXX)
gpg --recv-key 8BB9AD793E8E6153AF0F9A4416530D5E920F5C65
curl -s https://storage.googleapis.com/git-repo-downloads/repo.asc | gpg --verify - ${REPO} && install -m 755 ${REPO} ./repo
git config --global user.name fanning
git config --global user.email fanningnguyen@gmail.com
./repo init -u https://android.googlesource.com/platform/manifest
./repo init -u https://github.com/TinkerBoard2-Android/manifest.git -b android11-rk3399 -m tinker_board_2-android11-2.0.1.xml
./repo sync
```

## 2. Compile Android 11 Tinker Board 2/2S
```shell
source build/envsetup.sh
lunch WW_Tinker_Board_2-userdebug
./build.sh -UCKAu
```








