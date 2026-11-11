#include <gccore.h>
#include <wiiuse/wpad.h>
#include <ogc/pad.h>
#include <fat.h>
#include <dirent.h>
#include <sys/stat.h>
#include <stdio.h>
#include <string.h>

#define ROOT_DIR "sd:/brawl-mods"
#define MAX_ITEMS 96
#define NAME_LEN 128
#define PATH_LEN 512
#define VISIBLE_ITEMS 12
#define MAX_DEPTH 8

typedef struct { char name[NAME_LEN]; int is_dir; unsigned long size; } BrowserItem;
static void *xfb;
static GXRModeObj *rmode;
static BrowserItem items[MAX_ITEMS];
static unsigned item_count, selected, depth, scroll_top;
static int sd_ready;
static char current_path[PATH_LEN] = ROOT_DIR;
static char path_stack[MAX_DEPTH][PATH_LEN];
static char status[160] = "Press B to scan the SD card.";

static void set_status(const char *s) { snprintf(status, sizeof(status), "%s", s); }
static void format_size(unsigned long n, char *out, size_t len) {
    if (n < 1024UL) snprintf(out, len, "%lu B", n);
    else if (n < 1024UL*1024UL) snprintf(out, len, "%.1f KB", (double)n/1024.0);
    else snprintf(out, len, "%.1f MB", (double)n/(1024.0*1024.0));
}
static void scan_directory(void) {
    DIR *dir; struct dirent *entry;
    item_count=selected=scroll_top=0;
    if (!sd_ready) { set_status("SD card is not mounted. Check it, then press B."); return; }
    dir=opendir(current_path);
    if (!dir) { set_status("Cannot open folder. Press B to rescan."); return; }
    while ((entry=readdir(dir))!=NULL && item_count<MAX_ITEMS) {
        char full[PATH_LEN]; struct stat st;
        if (entry->d_name[0]=='.') continue;
        if (snprintf(full,sizeof(full),"%s/%s",current_path,entry->d_name)>=(int)sizeof(full)) continue;
        if (stat(full,&st)!=0) continue;
        snprintf(items[item_count].name,NAME_LEN,"%s",entry->d_name);
        items[item_count].is_dir=S_ISDIR(st.st_mode)?1:0;
        items[item_count].size=items[item_count].is_dir?0UL:(unsigned long)st.st_size;
        ++item_count;
    }
    closedir(dir);
    if (!item_count) set_status("Folder is empty. Add mod folders under sd:/brawl-mods.");
    else snprintf(status,sizeof(status),"Found %u item(s). A opens folders; B goes back.",item_count);
}
static void move_selection(int d) {
    if (!item_count) return;
    if (d<0 && selected>0) --selected;
    if (d>0 && selected+1<item_count) ++selected;
    if (selected<scroll_top) scroll_top=selected;
    if (selected>=scroll_top+VISIBLE_ITEMS) scroll_top=selected-VISIBLE_ITEMS+1;
}
static void open_selected(void) {
    if (!item_count) { set_status("Nothing selected. Add files to sd:/brawl-mods."); return; }
    if (items[selected].is_dir) {
        if (depth>=MAX_DEPTH) { set_status("Folder nesting limit reached."); return; }
        snprintf(path_stack[depth],PATH_LEN,"%s",current_path);
        ++depth;
        if (snprintf(current_path,sizeof(current_path),"%s/%s",path_stack[depth-1],items[selected].name)>=(int)sizeof(current_path)) {
            --depth; set_status("Folder path is too long."); return;
        }
        scan_directory();
    } else {
        char size[32], msg[160];
        format_size(items[selected].size,size,sizeof(size));
        snprintf(msg,sizeof(msg),"Selected: %.92s (%s). Mod loading is not enabled.",items[selected].name,size);
        set_status(msg);
    }
}
static void back_or_rescan(void) {
    if (depth) { --depth; snprintf(current_path,sizeof(current_path),"%s",path_stack[depth]); scan_directory(); }
    else { sd_ready=fatInitDefault()?1:0; scan_directory(); }
}
static void draw(void) {
    printf("\x1b[2J");
    printf("\x1b[2;2H BRAWL MOD MANAGER - WII TEST BUILD\n");
    printf("\n  SD CARD: %s\n  Folder: %.76s\n\n",sd_ready?"MOUNTED":"NOT MOUNTED",current_path);
    if (!item_count) printf("  No items in this folder.\n");
    else {
        unsigned end=scroll_top+VISIBLE_ITEMS; if (end>item_count) end=item_count;
        for (unsigned i=scroll_top;i<end;++i) {
            char size[32];
            if (items[i].is_dir) snprintf(size,sizeof(size),"<DIR>");
            else format_size(items[i].size,size,sizeof(size));
            printf("  %s %-28.28s %9s\n",i==selected?">":" ",items[i].name,size);
        }
        printf("\n  Item %u of %u\n",selected+1,item_count);
    }
    printf("\n  UP/DOWN: select   A: open / file info\n");
    printf("  B: back / rescan   HOME / START: exit\n");
    printf("\n  Status: %.140s\n",status);
    printf("\n  TEST BUILD: SD browsing only; no cloud sync or Brawl patching.\n");
}
int main(int argc,char **argv) {
    (void)argc; (void)argv;
    VIDEO_Init(); PAD_Init(); WPAD_Init();
    rmode=VIDEO_GetPreferredMode(NULL);
    xfb=MEM_K0_TO_K1(SYS_AllocateFramebuffer(rmode));
    console_init(xfb,20,20,rmode->fbWidth,rmode->xfbHeight,rmode->fbWidth*VI_DISPLAY_PIX_SZ);
    VIDEO_Configure(rmode); VIDEO_SetNextFramebuffer(xfb); VIDEO_SetBlack(FALSE); VIDEO_Flush(); VIDEO_WaitVSync();
    if (rmode->viTVMode&VI_NON_INTERLACE) VIDEO_WaitVSync();
    sd_ready=fatInitDefault()?1:0;
    if (sd_ready) { mkdir(ROOT_DIR,0777); scan_directory(); }
    else set_status("SD mount failed. Insert card and press B.");
    draw();
    for (;;) {
        WPAD_ScanPads(); PAD_ScanPads();
        u32 w=WPAD_ButtonsDown(0), g=PAD_ButtonsDown(0);
        if ((w&WPAD_BUTTON_HOME)||(g&PAD_BUTTON_START)) SYS_ResetSystem(SYS_RETURNTOMENU,0,0);
        if ((w&WPAD_BUTTON_B)||(g&PAD_BUTTON_B)) { back_or_rescan(); draw(); }
        if ((w&WPAD_BUTTON_UP)||(g&PAD_BUTTON_UP)) { move_selection(-1); set_status("Selection changed."); draw(); }
        if ((w&WPAD_BUTTON_DOWN)||(g&PAD_BUTTON_DOWN)) { move_selection(1); set_status("Selection changed."); draw(); }
        if ((w&WPAD_BUTTON_A)||(g&PAD_BUTTON_A)) { open_selected(); draw(); }
        VIDEO_WaitVSync();
    }
    return 0;
}