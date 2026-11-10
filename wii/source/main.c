#include <gccore.h>
#include <wiiuse/wpad.h>
#include <ogc/pad.h>
#include <stdio.h>
#include <string.h>

static void *xfb;
static GXRModeObj *rmode;
static const char *profiles[] = {
    "Default Brawl profile (placeholder)",
    "REX profile (not configured)",
    "Custom profile (not configured)"
};
static const unsigned profile_count = sizeof(profiles) / sizeof(profiles[0]);

static void draw(unsigned selected, const char *status) {
    printf("\x1b[2J");
    printf("\x1b[2;4H BRAWL MOD MANAGER - Wii\n");
    printf("\n  Wii companion to the separate Brawl Cloud web library.\n\n");
    for (unsigned i = 0; i < profile_count; ++i)
        printf("  %s %s\n", i == selected ? ">" : " ", profiles[i]);
    printf("\n  UP/DOWN: select    A: details    HOME: exit\n\n");
    printf("  Status: %s\n", status);
    printf("\n  Standalone Wii app prototype. Cloud sync is not implemented yet.\n");
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

    unsigned selected = 0;
    char status[120] = "Ready. Waiting for the shared Brawl Cloud API.";
    draw(selected, status);
    for (;;) {
        WPAD_ScanPads();
        PAD_ScanPads();
        u32 down = WPAD_ButtonsDown(0);
        u32 gc = PAD_ButtonsDown(0);
        if ((down & WPAD_BUTTON_HOME) || (gc & PAD_BUTTON_START))
            SYS_ResetSystem(SYS_RETURNTOMENU, 0, 0);
        if ((down & WPAD_BUTTON_UP) || (gc & PAD_BUTTON_UP)) {
            if (selected > 0) --selected;
            strcpy(status, "Profile selection changed.");
            draw(selected, status);
        }
        if ((down & WPAD_BUTTON_DOWN) || (gc & PAD_BUTTON_DOWN)) {
            if (selected + 1 < profile_count) ++selected;
            strcpy(status, "Profile selection changed.");
            draw(selected, status);
        }
        if ((down & WPAD_BUTTON_A) || (gc & PAD_BUTTON_A)) {
            snprintf(status, sizeof(status), "Selected: %.65s. RiiFS profile integration is next.", profiles[selected]);
            draw(selected, status);
        }
        VIDEO_WaitVSync();
    }
    return 0;
}
