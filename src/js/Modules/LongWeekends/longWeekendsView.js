// longWeekendsView.js
// Main view: fetches long weekends for the selected country/year and renders the cards

import { fetchLongWeekends } from "./longWeekendsApi.js";
import { renderLongWeekendCard } from "./longWeekendsCard.js";
import {
  getSelection,
  hasCountrySelected,
} from "../component/selectionState.js";
import { renderEmptyState } from "../component/emptyState.js";
import { showLoading, hideLoading } from "../component/loadingOverlay.js";
import { goToView } from "../component/router.js";
import { attachSaveButton } from "../plans/plansSaveHelper.js";
import { Plan } from "../plans/plan.js";

const DEFAULT_YEAR = 2026;

function renderNoCountrySelected() {
  hideSelectionBadge();

  renderEmptyState("lw-content", {
    icon: "fa-solid fa-umbrella-beach",
    title: "No Country Selected",
    subtitle: "Select a country from the dashboard to find long weekends",
    onButtonClick: function () {
      goToView("dashboard");
    },
  });
}

function hideSelectionBadge() {
  const badge = document.getElementById("lw-selection-badge");
  if (!badge) return;

  badge.innerHTML = "";
  badge.style.display = "none";
}

function renderNoLongWeekends(year) {
  renderEmptyState("lw-content", {
    icon: "fa-solid fa-calendar-xmark",
    title: "No Long Weekends Found",
    subtitle: "No long weekends were found for " + year,
  });
}

function updateSelectionBadge(selection, year) {
  const badge = document.getElementById("lw-selection-badge");
  if (!badge) return;

  const countryCodeLower = selection.countryCode.toLowerCase();

  badge.style.display = "";
  badge.innerHTML =
    '<img src="https://flagcdn.com/w40/' +
    countryCodeLower +
    '.png" alt="' +
    selection.countryName +
    '" class="selection-flag" />' +
    "<span>" +
    selection.countryName +
    "</span>" +
    '<span class="selection-year">' +
    year +
    "</span>";
}

// The cards themselves are built as HTML strings (renderLongWeekendCard),
// so there's no live DOM element to attach a click listener to at build time.
// Instead, we insert the full HTML first, then walk the resulting .lw-card
// elements in the same order as the `weekends` array and wire each one up -
// index i in the DOM always corresponds to weekends[i].
function renderLongWeekends(weekends, countryCode, countryName) {
  const content = document.getElementById("lw-content");

  let cardsHtml = "";
  for (let i = 0; i < weekends.length; i++) {
    cardsHtml += renderLongWeekendCard(weekends[i], i, countryCode);
  }

  content.innerHTML = cardsHtml;

  const cardElements = content.querySelectorAll(".lw-card");
  for (let i = 0; i < cardElements.length; i++) {
    const plan = Plan.fromLongWeekend(weekends[i], countryName);
    const saveBtn = cardElements[i].querySelector(".holiday-action-btn");
    attachSaveButton(saveBtn, plan);
  }
}

export async function initLongWeekendsView() {
  if (!hasCountrySelected()) {
    renderNoCountrySelected();
    return;
  }

  const selection = getSelection();
  const year = selection.year || DEFAULT_YEAR;

  updateSelectionBadge(selection, year);

  showLoading();
  try {
    const weekends = await fetchLongWeekends(year, selection.countryCode);

    if (!weekends) {
      ("lw-content", {
        icon: "fa-solid fa-triangle-exclamation",
        title: "Couldn't Load Long Weekends",
        subtitle: "Something went wrong while fetching data. Please try again.",
        onButtonClick: function () {
          goToView("dashboard");
        },
      });
      return;
    }

    if (weekends.length === 0) {
      renderNoLongWeekends(year);
      return;
    }

    renderLongWeekends(weekends, selection.countryCode, selection.countryName);
  } finally {
    hideLoading();
  }
}
