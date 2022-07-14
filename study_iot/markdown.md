---
sort: 1
---

# CROSS COMPILE MỘT ỨNG DỤNG CHO EMBEDED COMPUTER

#### Hardware

Hisilicon Hi3518

Processor Core
ARM926@540 MHz, 32 KB I-cache, 32 KB D-cache

#### openssl library
```shell
wget --no-check-certificate https://github.com/openssl/openssl/archive/refs/tags/OpenSSL_1_0_2u.tar.gz

tar -xvf OpenSSL_1_0_2u.tar.gz

cd OpenSSL_1_0_2u/

./Configure linux-armv4 -fPIC no-asm no-async -shared --prefix=/mnt/midware --cross-compile-prefix=/opt/hisi-linux/x86-arm/arm-hisiv300-linux/bin/arm-hisiv300-linux-uclibcgnueabi-

make -j8

sudo make install
```

#### mosquitto library

```shell
    
wget --no-check-certificate https://github.com/eclipse/mosquitto/archive/refs/tags/v1.6.6.tar.gz

tar -xvf v1.6.6.tar.gz

cd mosquitto-1.6.6/

vim config.mk
```

Thư viện mosquitto yêu cầu có ssl để biên dịch, nên khi biên dịch mosquitto chúng ta cần trỏ đường dẫn các file header và file thư viện openssl đã build vào file config.mk của mosquitto.

#### Add 2 line below to file “config.mk” with “/mnt/midware” is prefix path when we compile openssl
```shell
CFLAGS  += -I/mnt/midware/include

LDFLAGS += -L/mnt/midware/lib -lssl -lcrypto
```


#### At the end of the file, change as below

- From "prefix=/usr/local" to "prefix=/mnt/midware"

```shell
make CC=/opt/hisi-linux/x86-arm/arm-hisiv300-linux/bin/arm-hisiv300-linux-uclibcgnueabi-gcc CXX=/opt/hisi-linux/x86-arm/arm-hisiv300-linux/bin/arm-hisiv300-linux-uclibcgnueabi-g++ AR=/opt/hisi-linux/x86-arm/arm-hisiv300-linux/bin/arm-hisiv300-linux-uclibcgnueabi-ar LD=/opt/hisi-linux/x86-arm/arm-hisiv300-linux/bin/arm-hisiv300-linux-uclibcgnueabi-ld

sudo make install
```


Now, all the libraries and header files are located in the "/mnt/midware" directory 

Compress midware directory and copy to target

```shell
sudo tar -cvjSf ./midware.tar.gz /mnt/midware
```

### Compile IoT C app with Openssl and Mosquitto

#### Create a folder with 2 files below file
  
- Makefile
- mosq.c

#### Makefile
```shell
NAME_MODULE	= mosq
CXX		= /opt/hisi-linux/x86-arm/arm-hisiv300-linux/bin/arm-hisiv300-linux-uclibcgnueabi-g++
CC		= /opt/hisi-linux/x86-arm/arm-hisiv300-linux/bin/arm-hisiv300-linux-uclibcgnueabi-gcc
OBJ_DIR		= build_$(NAME_MODULE)
APP_DIR		=

OPTIMIZE_OPTION	=	-g -O3
WARNNING_OPTION	+=	-Wno-missing-field-initializers

CFLAGS	+= -I./
VPATH	+= ./
OBJ += $(OBJ_DIR)/mosq.o

FLAGS	+= -I/mnt/midware/include

# CXX compiler option
CFLAGS	+=	$(OPTIMIZE_OPTION)	\
		$(WARNNING_OPTION)	\
		-Wall			\
		-finline-functions	\
		-pipe			\
		-g			\

# Library paths
LDFLAGS	+= -L/mnt/midware/lib
LDFLAGS	+= -Wl,-Map=$(OBJ_DIR)/$(NAME_MODULE).map

#Library libs
LDLIBS	+=	-lpthread				\
		-lrt					\
		-lm					\
		-lmosquitto				\
		-Xlinker -rpath=/mnt/midware/lib	\

all: create $(OBJ_DIR)/$(NAME_MODULE)

create:
	@echo mkdir -p $(OBJ_DIR)
	@mkdir -p $(OBJ_DIR)

$(OBJ_DIR)/%.o: %.c
	@echo CXX $<
	@$(CC) -c -o $@ $< $(FLAGS) $(LDFLAGS) $(LDLIBS)

$(OBJ_DIR)/$(NAME_MODULE): $(OBJ)
	@echo ---------- START LINK PROJECT ----------
	@echo $(CC) -o $@ $^ $(CFLAGS)
	$(CC) -o $@ $^ $(CFLAGS) $(LDFLAGS) $(LDLIBS)

.PHONY: clean
clean:
	@echo rm -rf $(OBJ_DIR)
	@rm -rf $(OBJ_DIR)
	
.PHONY: copy
copy:
	ncftpput -u root -p 000 192.168.1.111 /opt/fanning/ build_$(NAME_MODULE)/mosq
	ncftpput -u root -p 000 192.168.1.111 /opt/fanning/ midware.tar.gz
```


#### mosq.c

```shell
#include <stdio.h>
#include <time.h>
#include <stdint.h>
#include <string.h>
#include <mosquitto.h>

struct mosquitto *mosquitto;

void on_message(struct mosquitto *mosq, void *obj, const struct mosquitto_message *message);
void on_connect(struct mosquitto *mosq, void *obj, int result);
void on_disconnect(struct mosquitto *mosq, void *obj, int rc);
void on_log(struct mosquitto *mosq, void *obj, int level, const char *str);

void set_topic_status(const char* topic);
void set_topic_subcribe(const char* topic);

int mqtt_init();

int main() {

	printf("IoT application\n");

	mqtt_init();

	while(1) {

	}
}

int mqtt_init() {

	int rc;

	mosquitto_lib_init();
	mosquitto = mosquitto_new("MQTT-CLIENT", true, 0);

	mosquitto_disconnect_callback_set(mosquitto, on_disconnect);
	mosquitto_log_callback_set(mosquitto, on_log);
	mosquitto_connect_callback_set(mosquitto, on_connect);
	mosquitto_message_callback_set(mosquitto, on_message);

	rc = mosquitto_connect(mosquitto, "localhost", 1883, 60);
	if (rc != MOSQ_ERR_SUCCESS) {
		printf("connect mqtt false : %d\n", rc);
		return rc;
	}

	rc =  mosquitto_loop_forever(mosquitto, -1, 1);
	if (rc != MOSQ_ERR_SUCCESS) {
		printf("mosquitto_loop_start false : %d\n", rc);
		return rc;
	}
	
	while(1) {
	
	}
	
	return 0;

}

void on_disconnect(struct mosquitto *mosq, void *obj, int rc) {
	printf("Disconnect error: %d \n", rc);
}

void on_subscribe(struct mosquitto *mosq, void *obj, int mid, int qos_count, const int *granted_qos) {
	printf("on_subscribe callback mid: %d qos %d", mid, qos_count);
}

void on_connect(struct mosquitto *mosq, void *obj, int result) {
	printf("on_connect callback\n");
	if(!result){
		mosquitto_subscribe(mosquitto, NULL, "/device/", 0);
	}
}

void on_log(struct mosquitto *mosq, void *obj, int level, const char *str) {
	printf("log: mqtt %d, %s \n", level, str);
}

void on_message(struct mosquitto *mosq, void *obj, const struct mosquitto_message *message) {
	printf("[subcribe] topic:%s message:%s\n", message->topic, (char*)message->payload);
}
```


#### Compile application
```shell
cd app/
make -j8
```


#### On target export library path
Vì thư viện mình để ở "/mnt/midware/lib", một đường dẫn riêng do mình tạo ra, nên để file thực thi biết thư viện ở đâu chúng ta cần export đường dẫn "/mnt/midware/lib" vào biến môi trường "LD_LIBRARY_PATH"


```shell
export LD_LIBRARY_PATH=/mnt/midware/lib
```


#### Run application
```shell
./mosq
```
