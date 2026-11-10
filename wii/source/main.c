#include <gccore.h>
#include <wiiuse/wpad.h>
#include <ogc/pad.h>
#include <fat.h>
#include <dirent.h>
#include <sys/stat.h>
#include <stdio.h>
#include <string.h>
#include <strings.h>

#define MOD_DIR "sd:/brawl-mods"
#define MAX_MODS 24
#define NAME_LEN 96

static void *xfb;
static GXRModeObj *rmode;
static char mod_names[MAX_MODS][NAME_LEN];
static unsigned mod_count = 0;
static unsigned selected = 0;
static int sd_ready = 0;
static char status[120] = "Press B to scan the SD card.";

static void scan_mods(void) {
    DIR *dir;
    struct dirent *entry;
    mod_count = 0;
    selected = 0;
    if (!sd_ready) {
        strcpy(status, "SD card is not mounted. Check the card and retry.");
        return;
    }
    mkdir(MOD_DIR, 0777);
    dir = opendir(MOD_DIR);
    if (!dir) {
        strcpy(status, "Could not open sd:/brawl-mods.");
        return;
    }
    while ((entry = readdir(dir)) != NULL && mod_count < MAX_MODS) {
        if (entry->d_name[0] == '.') continue;
        snprintf(mod_names[mod_count], NAME_LEN, "%s", entry->d_name);
        ++mod_count;
    }
    closedir(dir);
    if (mod_count == 0) strcpy(status, "Folder is empty. Copy mod files from Drive onto the SD card.");
    else snprintf(status, sizeof(status), "Found %u file(s) in sd:/brawl-mods.", mod_count);
}

static void draw(void) {
    printf("\x1b[2J");
    printf("\x1b[2;3H BRAWL MOD MANAGER - SD CARD MODE\n");
    printf("\n  Google Drive is managed separately in your browser.\n");
    printf("  Copy downloaded files into: sd:/brawl-mods/\n\n");
    if (!sd_ready) {
        printf("  SD card: NOT MOUNTED\n");
    } else if (mod_count == 0) {
        printf("  No files found yet.\n");
    } else {
        unsigned start = selected > 7 ? selected - 7 : 0;
        unsigned end = start + 8;
        if (end > mod_count) end = mod_count;
        for (unsigned i = start; i < end; ++i)
            printf("  %s %s\n", i == selected ? ">" : " ", mod_names[i]);
    }
    printf("\n  UP/DOWN: select   A: file info   B: rescan\n");
    printf("  HOME / START: exit\n\n");
    printf("  Status: %s\n", status);
    printf("\n  File browser only. It does not install or patch Brawl.\n");
}

int main(int argc, char **argv) {
    (void)argc; (void)argv;
    VIDEO_Init();
    PAD_Init();
    WPAD_Init();
    rmode = VIDEO_GetPreferredMode(NULL);
    xfb = MEM_K0_TO_K1(SYS_AllocateFramebuffer(rmode));
    console_init(xfb, 20, 20, rmode->fbWidth, rmode->xfbHeight,
                 rmode->fbWidth * VI_DISPLAY_PIX_SZ);
    VIDEO_Configure(rmode);
    VIDEO_SetNextFramebuffer(xfb);
    VIDEO_SetBlack(FALSE);
    VIDEO_Flush();
    VIDEO_WaitVSync();
    if (rmode->viTVMode & VI_NON_INTERLACE) VIDEO_WaitVSync();

    sd_ready = fatInitDefault() ? 1 : 0;
    if (sd_ready) scan_mods();
    else strcpy(status, "SD mount failed. Insert an SD card and press B.");
    draw();

    for (;;) {
        WPAD_ScanPads();
        PAD_ScanPads();
        u32 down = WPAD_ButtonsDown(0);
        u32 gc = PAD_ButtonsDown(0);
        if ((down & WPAD_BUTTON_HOME) || (gc & PAD_BUTTON_START))
            SYS_ResetSystem(SYS_RETURNTOMENU, 0, 0);
        if ((down & WPAD_BUTTON_B) || (gc & PAD_BUTTON_B)) {
            sd_ready = fatInitDefault() ? 1 : 0;
            scan_mods();
            draw();
        }
        if ((down & WPAD_BUTTON_UP) || (gc & PAD_BUTTON_UP)) {
            if (mod_count && selected > 0) --selected;
            strcpy(status, "Selected file changed.");
            draw();
        }
        if ((down & WPAD_BUTTON_DOWN) || (gc & PAD_BUTTON_DOWN)) {
            if (mod_count && selected + 1 < mod_count) ++selected;
            strcpy(status, "Selected file changed.");
            draw();
        }
        if ((down & WPAD_BUTTON_A) || (gc & PAD_BUTTON_A)) {
            if (mod_count) snprintf(status, sizeof(status), "Selected: %.90s", mod_names[selected]);
            else strcpy(status, "No files to select. Copy mods into the SD folder.");
            draw();
        }
        VIDEO_WaitVSync();
    }
    return 0;
}
