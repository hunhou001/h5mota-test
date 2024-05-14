import React from "react";
import ReactDOM from "react-dom/client";
import App from "../../src/view/ScoreTable";
import { QueryClient, QueryClientProvider } from "react-query";
import { userInfoModel } from "../../src/utils/store";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <userInfoModel.Provider>
        <App />
      </userInfoModel.Provider>
    </QueryClientProvider>
  </React.StrictMode>
);
