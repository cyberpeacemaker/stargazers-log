const repositoryList = document.querySelector("#repository-list");
const repositoryCount = document.querySelector("#repository-count");
const loadError = document.querySelector("#load-error");

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
  date.textContent = `Starred ${new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(new Date(`${repository.starredAt}T00:00:00`))}`;

  const description = document.createElement("p");
  description.className = "repository-description";
  description.textContent = repository.description;

  const language = document.createElement("p");
  language.className = "repository-language";
  language.textContent = repository.language;

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

    const repositories = await response.json();
    repositoryList.replaceChildren(...repositories.map(createRepositoryItem));
    repositoryCount.textContent = `${repositories.length} repositories`;
  } catch (error) {
    repositoryCount.textContent = "Unavailable";
    loadError.hidden = false;
    loadError.textContent = "Could not load the repository list. Open this page through a local web server and try again.";
    console.error("Could not load events.json:", error);
  }
}

loadRepositories();