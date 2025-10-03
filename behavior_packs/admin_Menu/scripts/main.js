import { world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";

const commands = [
    { name: "天候: 晴れ", command: "weather clear" },
    { name: "天候: 雨", command: "weather rain" },
    { name: "ゲームモード: クリエイティブ", command: "gamemode creative @s" },
    { name: "ゲームモード: サバイバル", command: "gamemode survival @s" },
    { name: "全アイテム配布", command: "give @s minecraft:diamond 64" },
    { name: "時間: 昼", command: "time set day" },
    { name: "時間: 夜", command: "time set night" },
];
function showAdminMenu(player, page = 0) {
    // 権限チェック
    if (!player.isOp()) {
        const errorForm = new ModalFormData()
            .title("§4§lアクセス拒否されました")
            .body("§4§l管理パネルを使うには、必ず§eオペレーター§4§lが必要です。")
            .button("OK");
        errorForm.show(player);
        return;
    }
    const pageSize = 6;
    const pageCommands = commands.slice(page * pageSize, (page + 1) * pageSize);
    const form = new ModalFormData().title("管理パネル");

    pageCommands.forEach(cmd => form.button(cmd.name));

    if (page > 0) form.button("前のページ");
    if ((page + 1) * pageSize < commands.length) form.button("次のページ");

    form.show(player).then(response => {
        if (response.canceled) return;
        const idx = response.selection;

        if (idx < pageCommands.length) {
            player.runCommandAsync(pageCommands[idx].command);
            player.sendMessage(`コマンド実行: ${pageCommands[idx].command}`);
        } else if (idx === pageCommands.length && page > 0) {
            showAdminMenu(player, page - 1);
        } else if (idx === pageCommands.length && (page + 1) * pageSize < commands.length) {
            showAdminMenu(player, page + 1);
        }
    });
}

world.events.itemUse.subscribe(event => {
    const player = event.source;
    if (!player.isPlayer()) return;
    if (event.item.id === "admin_menu:item") {
        showAdminMenu(player);
    }
});