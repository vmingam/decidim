/* eslint-disable no-invalid-this */

import svg4everybody from "svg4everybody"
import formDatePicker from "src/decidim/form_datepicker"
import fixDropdownMenus from "src/decidim/dropdowns_menus"
import createQuillEditor from "src/decidim/editor"
import Configuration from "src/decidim/configuration"
import ExternalLink from "src/decidim/redesigned_external_link"
import updateExternalDomainLinks from "src/decidim/external_domain_warning"
import scrollToLastChild from "src/decidim/scroll_to_last_child"
import InputCharacterCounter, { createCharacterCounter } from "src/decidim/redesigned_input_character_counter"
import FormValidator from "src/decidim/form_validator"
import CommentsComponent from "src/decidim/comments/comments.component"
import DataPicker from "src/decidim/data_picker"
import FormFilterComponent from "src/decidim/form_filter"
import addInputEmoji, { CreateEmojiButton } from "src/decidim/input_emoji"
import dialogMode from "src/decidim/dialog_mode"
import FocusGuard from "src/decidim/focus_guard"
import backToListLink from "src/decidim/back_to_list"
import Accordions from "a11y-accordion-component";
import Dropdowns from "a11y-dropdown-component";
import Dialogs from "a11y-dialog-component";
import markAsReadNotifications from "src/decidim/notifications"
import { StreamActions } from "@hotwired/turbo"

window.Decidim = window.Decidim || {};
window.Decidim.config = new Configuration()
window.Decidim.ExternalLink = ExternalLink;
window.Decidim.InputCharacterCounter = InputCharacterCounter;
window.Decidim.FormValidator = FormValidator;
window.Decidim.DataPicker = DataPicker;
window.Decidim.CommentsComponent = CommentsComponent;
window.Decidim.addInputEmoji = addInputEmoji;
window.Decidim.CreateEmojiButton = CreateEmojiButton;

const basic_initializer = () => {
  // initialize character counter
  $("input[type='text'], textarea, .editor>input[type='hidden']").each((_i, elem) => {
    const $input = $(elem);

    if (!$input.is("[minlength]") && !$input.is("[maxlength]")) {
      return;
    }

    createCharacterCounter($input);
  });
}

const initializer = () => {
  window.theDataPicker = new DataPicker($(".data-picker"));
  window.focusGuard = new FocusGuard(document.querySelector("body"));

  $(document).foundation();
  $(document).on("open.zf.reveal", (ev) => {
    dialogMode($(ev.target));
  });

  // Trap the focus within the mobile menu if the user enters it. This is an
  // accessibility feature forcing the focus within the offcanvas container
  // which holds the mobile menu.
  $("#offCanvas").on("openedEnd.zf.offCanvas", (ev) => {
    ev.target.querySelector(".main-nav a").focus();
    window.focusGuard.trap(ev.target);
  }).on("closed.zf.offCanvas", () => {
    window.focusGuard.disable();
  });

  fixDropdownMenus();

  svg4everybody();

  // Prevent data-open buttons e.g. from submitting the underlying form in
  // authorized action buttons.
  $("[data-open]").on("click", (event) => {
    event.preventDefault();
  });

  formDatePicker();

  $(".editor-container").each((_idx, container) => {
    createQuillEditor(container);
  });

  document.querySelectorAll("a[target=\"_blank\"]:not([data-external-link=\"false\"])").forEach((elem) => new ExternalLink(elem))

  // initialize character counter
  $("input[type='text'], textarea, .editor>input[type='hidden']").each((_i, elem) => {
    const $input = $(elem);

    if (!$input.is("[minlength]") && !$input.is("[maxlength]")) {
      return;
    }

    createCharacterCounter($input);
  });

  // Mount comments component
  $("[data-decidim-comments]").each((_i, el) => {
    const $el = $(el);
    const comments = new CommentsComponent($el, $el.data("decidim-comments"));
    comments.mountComponent();
    $(el).data("comments", comments);
  });

  $("form.new_filter").each(function () {
    const formFilter = new FormFilterComponent($(this));

    formFilter.mountComponent();
  })

  updateExternalDomainLinks($("body"))

  addInputEmoji()

  backToListLink(document.querySelectorAll(".js-back-to-list"));

  Accordions.init();
  Dropdowns.init();
  document.querySelectorAll("[data-dialog]").forEach(
    ({ dataset: { dialog } }) =>
      new Dialogs(`[data-dialog="${dialog}"]`, {
        openingSelector: `[data-dialog-open="${dialog}"]`,
        closingSelector: `[data-dialog-close="${dialog}"]`,
        labelledby: `dialog-title-${dialog}`,
        describedby: `dialog-desc-${dialog}`
      })
  );

  markAsReadNotifications()

  scrollToLastChild()
}

/**
 * Initializer event for those script who require to be triggered
 * when the page is loaded
 */
// If no jQuery is used the Tribute feature used in comments to autocomplete
// mentions stops working
// document.addEventListener("DOMContentLoaded", () => {
$(() => initializer());

document.addEventListener("turbo:frame-render", (_frame) => {
  initializer()
})

document.addEventListener("turbo:load", (_frame) => {
  basic_initializer();
})

StreamActions.open_drawer = function() {
  const frameId = this.getAttribute("frame_id");
  const drawer = document.getElementById(frameId);
  const filteredPath = drawer.dataset.filteredPath;

  if (filteredPath) {
    drawer.querySelector("a[data-drawer-close]").setAttribute("href", filteredPath);
  }

  document.querySelectorAll(`#${frameId} [data-drawer]`).forEach(
    ({ dataset: { drawer } }) =>
    new Dialogs(`[data-drawer="${drawer}"]`, {
      closingSelector: `[data-drawer-close="${drawer}"]`
    }).open()
  )
}
