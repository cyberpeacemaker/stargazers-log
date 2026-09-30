const repositoryList = document.querySelector("#repository-list");
const repositoryCount = document.querySelector("#repository-count");
const loadError = document.querySelector("#load-error");
const dateFormatter = new Intl.DateTimeFormat("en", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC"
});

function validateRepositories(value) {
  if (!Array.isArray(value)) {
    throw new Error("Expected events.json to contain an array");
  }

  return value.map((repository, index) => {
    if (!repository || typeof repository !== "object") {
      throw new Error(`Repository ${index + 1} must be an object`);
    }

    const url = new URL(repository.url);
    if (
      typeof repository.fullName !== "string" ||
      !repository.fullName.trim() ||
      url.protocol !== "https:" ||
      url.hostname !== "github.com" ||
      !/^\/[^/]+\/[^/]+\/?$/.test(url.pathname) ||
      typeof repository.starredAt !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(repository.starredAt)
    ) {
      throw new Error(`Repository ${index + 1} has invalid required fields`);
    }

    const date = new Date(`${repository.starredAt}T00:00:00Z`);
    if (date.toISOString().slice(0, 10) !== repository.starredAt) {
      throw new Error(`Repository ${index + 1} has an invalid starredAt date`);
    }

    return repository;
  });
}

function createRepositoryItem(repository) {
  const item = document.createElement("li");
  item.className = "repository-item";

  const topLine = document.createElement("div");
  topLine.className = "repository-top-line";

  const link = document.createElement("a");
  link.className = "repository-name";
  link.href = repository.url;
  link.target = "_blank";
  link.rel = "noreferrer";
  link.textContent = repository.fullName;

  const date = document.createElement("time");
  date.className = "starred-date";
  date.dateTime = repository.starredAt;
  date.textContent = `Starred ${dateFormatter.format(new Date(`${repository.starredAt}T00:00:00Z`))}`;

  const description = document.createElement("p");
  description.className = "repository-description";
  description.textContent = repository.description || "No description provided.";

  const language = document.createElement("p");
  language.className = "repository-language";
  language.textContent = repository.language || "Language not specified";

  topLine.append(link, date);
  item.append(topLine, description, language);
  return item;
}

async function loadRepositories() {
  try {
    const response = await fetch("events.json");
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const repositories = validateRepositories(await response.json());
    repositoryList.replaceChildren(...repositories.map(createRepositoryItem));
    repositoryCount.textContent = repositories.length === 1
      ? "1 repository"
      : `${repositories.length} repositories`;
  } catch (error) {
    repositoryCount.textContent = "Unavailable";
    loadError.hidden = false;
    loadError.textContent = "Could not load the repository list. Check events.json and refresh the page.";
    console.error("Could not load events.json:", error);
  }
}

loadRepositories();