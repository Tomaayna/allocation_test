import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogOverlay,      // ← 追加
} from "./ui/alert-dialog";

export default function ConfirmDelete({
  open,
  targetName,
  onConfirm,
  onClose,
}: {
  open: boolean;
  targetName: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      {/* ★ 背景を真っ白 80% 不透明に */}
      <AlertDialogOverlay className="fixed inset-0 bg-white/80" />

      {/* ★ ダイアログ本体も白固定 */}
      <AlertDialogContent className="bg-white text-black">
        <AlertDialogHeader>
          <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
          <AlertDialogDescription>
            「{targetName}」を今日のルートから削除します。<br />
            この操作は取り消せません。
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>キャンセル</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={onConfirm}
          >
            削除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
