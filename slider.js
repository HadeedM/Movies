document.addEventListener("DOMContentLoaded", () => {
    const defaultPosterImage = "https://image.tmdb.org/t/p/w500/8UlWHLMpgZm9bx6QYh0NFoq67TZ.jpg";

    document.querySelectorAll(".movie-card").forEach((card) => {
        const posterContainer = card.querySelector(".movie-poster");
        if (!posterContainer) {
            return;
        }

        const titleText = card.querySelector(".movie-title")?.textContent?.trim() || "Movie";
        let posterImage = posterContainer.querySelector("img");

        if (!posterImage) {
            posterImage = document.createElement("img");
            posterImage.loading = "lazy";
            posterContainer.prepend(posterImage);
        }

        const setFallbackPoster = () => {
            if (posterImage.dataset.fallbackApplied === "true") {
                return;
            }
            posterImage.dataset.fallbackApplied = "true";
            posterImage.src = defaultPosterImage;
            posterImage.alt = `${titleText} poster`;
        };

        const currentSrc = (posterImage.getAttribute("src") || "").trim();
        if (!currentSrc || currentSrc === "#") {
            setFallbackPoster();
        }

        if (!posterImage.getAttribute("alt")) {
            posterImage.alt = `${titleText} poster`;
        }

        posterImage.addEventListener("error", setFallbackPoster, { once: true });
    });

    const sliderContainers = document.querySelectorAll(".slider-container");

    sliderContainers.forEach((container) => {
        const sliderWrapper = container.querySelector(".slider-wrapper");
        const sliderTrack = container.querySelector(".slider-track");
        const previousButton = container.querySelector(".prev-btn");
        const nextButton = container.querySelector(".next-btn");

        if (!sliderWrapper || !sliderTrack || !previousButton || !nextButton) {
            return;
        }

        const getScrollAmount = () => {
            const firstCard = sliderTrack.querySelector(".slider-card");
            const cardGap = parseFloat(window.getComputedStyle(sliderTrack).gap || "0");

            if (!firstCard) {
                return sliderWrapper.clientWidth * 0.8;
            }

            return firstCard.getBoundingClientRect().width + cardGap;
        };

        previousButton.addEventListener("click", () => {
            sliderWrapper.scrollBy({
                left: -getScrollAmount(),
                behavior: "smooth"
            });
        });

        nextButton.addEventListener("click", () => {
            sliderWrapper.scrollBy({
                left: getScrollAmount(),
                behavior: "smooth"
            });
        });
    });

    const moviesContainer = document.querySelector(".movies-container[data-page-sizes]");
    const paginationButtons = document.querySelectorAll(".pagination-btn[data-page]");
    const previousPageButton = document.querySelector('[data-pagination-direction="prev"]');
    const nextPageButton = document.querySelector('[data-pagination-direction="next"]');

    if (!moviesContainer || !paginationButtons.length || !previousPageButton || !nextPageButton) {
        return;
    }

    const movieCards = Array.from(moviesContainer.querySelectorAll(".movie-card"));
    const pageSizes = (moviesContainer.dataset.pageSizes || "")
        .split(",")
        .map((value) => Number.parseInt(value.trim(), 10))
        .filter((value) => Number.isFinite(value) && value > 0);

    if (!movieCards.length || !pageSizes.length) {
        return;
    }

    let currentPageIndex = 0;
    let pageStartIndex = 0;

    const pageRanges = pageSizes.map((pageSize) => {
        const startIndex = pageStartIndex;
        const endIndex = startIndex + pageSize;
        pageStartIndex = endIndex;
        return { startIndex, endIndex };
    });

    const updatePagination = (pageIndex, shouldScroll = true) => {
        const safePageIndex = Math.max(0, Math.min(pageIndex, pageRanges.length - 1));
        const activeRange = pageRanges[safePageIndex];

        movieCards.forEach((card, index) => {
            card.hidden = index < activeRange.startIndex || index >= activeRange.endIndex;
        });

        paginationButtons.forEach((button) => {
            const buttonPageIndex = Number.parseInt(button.dataset.page || "1", 10) - 1;
            const isActive = buttonPageIndex === safePageIndex;

            button.classList.toggle("is-active", isActive);
            if (isActive) {
                button.setAttribute("aria-current", "page");
            } else {
                button.removeAttribute("aria-current");
            }
        });

        previousPageButton.disabled = safePageIndex === 0;
        nextPageButton.disabled = safePageIndex === pageRanges.length - 1;
        currentPageIndex = safePageIndex;
        if (shouldScroll) {
            moviesContainer.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    paginationButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const targetPageIndex = Number.parseInt(button.dataset.page || "1", 10) - 1;
            updatePagination(targetPageIndex);
        });
    });

    previousPageButton.addEventListener("click", () => {
        updatePagination(currentPageIndex - 1);
    });

    nextPageButton.addEventListener("click", () => {
        updatePagination(currentPageIndex + 1);
    });

    updatePagination(0, false);
});