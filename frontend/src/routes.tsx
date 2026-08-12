import { createBrowserRouter } from "react-router-dom";
import { App } from "./App.js";
import { HomePage } from "./pages/HomePage.js";
import { CardsSearchPage } from "./pages/CardsSearchPage.js";
import { DeckBuilderPage } from "./pages/DeckBuilderPage.js";
import { DecksListPage } from "./pages/DecksListPage.js";
import { ComingSoonPage } from "./pages/ComingSoonPage.js";
import { RulesPage } from "./pages/RulesPage.js";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "cards", element: <CardsSearchPage /> },
      { path: "decks/new", element: <DeckBuilderPage /> },
      { path: "decks/:id/edit", element: <DeckBuilderPage /> },
      { path: "decks", element: <DecksListPage /> },
      { path: "reviews", element: <ComingSoonPage title="Reviews" /> },
      { path: "rules", element: <RulesPage /> },
    ],
  },
]);
