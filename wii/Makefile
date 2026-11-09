# devkitPPC / libogc Homebrew Channel application
TARGET := boot
BUILD := build
SOURCES := source
DATA :=
INCLUDES :=

CFLAGS := -O2 -Wall -Wextra -mcpu=750 -meabi -mhard-float
CXXFLAGS := $(CFLAGS)
LDFLAGS = -g $(MACHDEP) -Wl,-Map,$(notdir $@).map
LIBS := -lwiiuse -lbte -logc -lm

include $(DEVKITPPC)/wii_rules
