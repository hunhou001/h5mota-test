import { Popover, Typography } from "@douyinfe/semi-ui";
import { IconHelpCircle } from "@douyinfe/semi-icons";
import { FC, useRef, useState } from "react";
import styles from "./index.module.less";

const COAUTHOR_HELP_TEXT = {
  home: "你是此塔的共同作者。具有测试员的全部权限，并且可以修改塔信息、更新塔文件、操作所有玩家的测试区录像。",
  info: "共同作者具有测试员的全部权限，并且可以修改塔信息、更新塔文件、操作所有玩家的测试区录像。请仅给予你信任的用户此权限！",
} as const;

type CoauthorHelpHintProps = {
  variant: keyof typeof COAUTHOR_HELP_TEXT;
};

const CoauthorHelpHint: FC<CoauthorHelpHintProps> = ({ variant }) => {
  const [visible, setVisible] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();

  const cancelHide = () => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = undefined;
    }
  };

  const open = () => {
    cancelHide();
    setVisible(true);
  };

  const scheduleHide = () => {
    cancelHide();
    hideTimer.current = setTimeout(() => setVisible(false), 200);
  };

  const content = (
    <div
      className={styles.tipBody}
      onMouseEnter={open}
      onMouseLeave={scheduleHide}
    >
      <Typography.Text>{COAUTHOR_HELP_TEXT[variant]}</Typography.Text>
    </div>
  );

  return (
    <Popover
      trigger="custom"
      visible={visible}
      onClickOutSide={() => setVisible(false)}
      showArrow
      position="bottomLeft"
      content={content}
    >
      <button
        type="button"
        className={styles.trigger}
        aria-label="共同作者说明"
        onMouseEnter={open}
        onMouseLeave={scheduleHide}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          cancelHide();
          setVisible((v) => !v);
        }}
      >
        <IconHelpCircle size="small" />
        <span>这是什么</span>
      </button>
    </Popover>
  );
};

export default CoauthorHelpHint;
