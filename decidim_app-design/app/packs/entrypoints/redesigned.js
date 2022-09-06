// Load a11y libraries
import Dialogs from "a11y-dialog-component";
document.querySelectorAll("[data-drawer]").forEach(
  ({ dataset: { drawer } }) =>
    new Dialogs(`[data-drawer="${drawer}"]`, {
      openingSelector: `[data-drawer-open="${drawer}"]`,
      closingSelector: `[data-drawer-close="${drawer}"]`
    })
);

// Images
require.context("../images", true)

// CSS
import "stylesheets/decidim/redesigned_application.scss";

// This needs to be loaded after confirm dialog to bind properly
import Rails from "@rails/ujs"
Rails.start()
