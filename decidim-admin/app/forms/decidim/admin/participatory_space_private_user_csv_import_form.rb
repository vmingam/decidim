# frozen_string_literal: true

require "csv"

module Decidim
  module Admin
    # A form object used to upload CSV to batch participatory space private users.
    #
    class ParticipatorySpacePrivateUserCsvImportForm < Form
      include Decidim::HasUploadValidations

      attribute :file
      attribute :user_name, String
      attribute :email, String

      validates :file, presence: true
      validate :validate_csv

      def validate_csv
        return if file.blank?

        CSV.foreach(file.path, encoding: "BOM|UTF-8") do |_email, user_name|
          errors.add(:user_name, :invalid) unless user_name.match?(UserBaseEntity::REGEXP_NAME)
        end
      rescue CSV::MalformedCSVError
        errors.add(:file, :malformed)
      end
    end
  end
end
