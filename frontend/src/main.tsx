import React from "react";
import ReactDOM from "react-dom/client";
import Form from "./form";
import "./index.css";


ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <div className="min-h-[100vh] py-10 grid place-items-center">
    <Form />
  </div>
);
