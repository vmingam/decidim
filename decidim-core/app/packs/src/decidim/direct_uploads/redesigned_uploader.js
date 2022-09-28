import { DirectUpload } from "@rails/activestorage";
import { createElement } from "src/decidim/direct_uploads/upload_utility";
import icon from "src/decidim/redesigned_icon";

export class Uploader {
  constructor(modal, options) {
    this.modal = modal;
    this.options = options;
    this.validationSent = false;
    this.errors = []

    if (modal.options.maxFileSize && options.file.size > modal.options.maxFileSize) {
      this.errors = [modal.locales.file_size_too_large]
    } else {
      this.upload = new DirectUpload(options.file, options.url, this);
    }
  }

  validate(blobId) {
    const callback = (data) => {
      let errors = []
      for (const [, value] of Object.entries(data)) {
        errors = errors.concat(value);
      }

      if (errors.length) {
        this.errors = errors;
      }
    }

    if (!this.validationSent) {
      let property = this.modal.options.addAttribute;
      if (this.modal.options.titled) {
        property = "file"
      }
      const params = new URLSearchParams({
        resourceClass: this.modal.options.resourceClass,
        property: property,
        blob: blobId,
        formClass: this.modal.options.formObjectClass
      });

      fetch(`/upload_validations?${params.toString()}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": $("meta[name=csrf-token]").attr("content")
        }
      }).then((response) => response.json()).then((data) => callback(data));

      this.validationSent = true;
    }
  }

  // The following method come from @rails/activestorage
  // further info: https://edgeguides.rubyonrails.org/active_storage_overview.html#direct-upload-javascript-events
  directUploadWillStoreFileWithXHR(request) {
    request.upload.addEventListener("progress", ({ loaded, total }) => this.modal.setProgressBar(this.options.attachmentName, Math.floor(loaded / total * 100)));
  }
}
