import { Typography } from "@douyinfe/semi-ui";
import { FC, ReactNode } from "react";
import styles from "./index.module.less";

type Props = {
  title: string;
  description: ReactNode;
  extra?: ReactNode;
};

const AdminDenied: FC<Props> = ({ title, description, extra }) => (
  <div className={styles.gateWrap}>
    <Typography.Title heading={4} type="danger">
      {title}
    </Typography.Title>
    <Typography.Paragraph style={{ marginTop: 12, color: "var(--semi-color-text-1)" }}>
      {description}
    </Typography.Paragraph>
    {extra != null ? <div style={{ marginTop: 20 }}>{extra}</div> : null}
  </div>
);

export default AdminDenied;
