import { useState } from "react";
import { Button } from "@douyinfe/semi-ui";
import { IconImage } from "@douyinfe/semi-icons";
import TopBar from "./TopBar";
import styles from "./App.module.less";
import References from "./References";
import DrawingBoard from "./DrawingBoard";
import ToolBar from "./ToolBar";
import ScoreTable from "./ScoreTable";

function App() {
  return (
    <>
      {/* <div className={styles.topbar}>
        <TopBar />
      </div>
      <div className={styles.main}>
        <div className={styles.leftSection}>
          <DrawingBoard />
        </div>
        <div className={styles.centerSection}>
          <ToolBar />
        </div>
        <div className={styles.rightSection}>
          <References />
        </div>
      </div> */}
      <ScoreTable />
    </>
  );
}

export default App;
