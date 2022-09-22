# frozen_string_literal: true

require "cell/partial"

module Decidim
  module Accountability
    # This cell renders the List (:l) result card
    # for an instance of a Result
    class ResultLCell < Decidim::CardLCell
      private

      def metadata_cell
        "decidim/accountability/result"
      end
    end
  end
end
