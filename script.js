
'use strict';

const STORAGE_KEY = 'albertros_jobs_v2';
const jobList = document.getElementById('job-list');
const jobForm = document.getElementById('job-form');
const searchInput = document.getElementById('search-input');
const locationFilter = document.getElementById('location-filter');
const typeFilter = document.getElementById('type-filter');
const experienceFilter = document.getElementById('experience-filter');
const resultsCount = document.getElementById('results-count');
const formMessage = document.getElementById('form-message');

const demoJobs = [
  {
    id: 'demo-1',
    title: 'Restaurant Team Member',
    company: 'Example Hospitality Group',
    location: 'New York',
    type: 'Part-time',
    experience: 'No experience',
    pay: '$18–$21 per hour',
    email: 'careers@example.com',
    description: 'Example listing for demonstration. Assist guests, prepare service areas and learn on the job. Training provided.'
  },
  {
    id: 'demo-2',
    title: 'Retail Sales Assistant',
    company: 'Sample City Stores',
    location: 'New York',
    type: 'Full-time',
    experience: 'Entry-level',
    pay: '$17–$20 per hour',
    email: 'jobs@example.com',
    description: 'Example listing for demonstration. Help customers, organize products and support the store team.'
  },
  {
    id: 'demo-3',
    title: 'Junior Customer Support Assistant',
    company: 'Open Path Services',
    location: 'Remote',
    type: 'Full-time',
    experience: 'Entry-level',
    pay: 'Pay disclosed by employer',
    email: 'hiring@example.com',
    description: 'Example listing for demonstration. Respond to customer questions and learn support tools with team guidance.'
  },
  {
    id: 'demo-4',
    title: 'Office Support Intern',
    company: 'Learning Bridge',
    location: 'Kenya',
    type: 'Internship',
    experience: 'No experience',
    pay: 'Stipend discussed',
    email: 'people@example.com',
    description: 'Example listing for demonstration. Support everyday office tasks while gaining practical workplace experience.'
  },
  {
    id: 'demo-5',
    title: 'Warehouse Assistant',
    company: 'Northstar Logistics',
    location: 'United States',
    type: 'Temporary',
    experience: 'Some experience',
    pay: 'Pay disclosed by employer',
    email: 'recruitment@example.com',
    description: 'Example listing for demonstration. Help receive, sort and prepare stock safely.'
  },
  {
    id: 'demo-6',
    title: 'Cafe Assistant',
    company: 'Corner Cup Example Cafe',
    location: 'United Kingdom',
    type: 'Part-time',
    experience: 'No experience',
    pay: 'Hourly pay stated by employer',
    email: 'work@example.com',
    description: 'Example listing for demonstration. Welcome customers, prepare the cafe and learn service skills.'
  }
];

function loadJobs() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? [...saved, ...demoJobs] : [...demoJobs];
  } catch (error) {
    console.warn('Could not read saved listings:', error);
    return [...demoJobs];
  }
}

let jobs = loadJobs();

function addTextElement(parent, tag, className, value) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = value == null ? '' : String(value);
  parent.appendChild(element);
  return element;
}

function createJobCard(job) {
  const card = document.createElement('article');
  card.className = 'job-card';

  const top = document.createElement('div');
  top.className = 'job-card-top';

  const avatar = addTextElement(
    top,
    'div',
    'company-avatar',
    (job.company || 'A').trim().charAt(0).toUpperCase()
  );
  avatar.setAttribute('aria-hidden', 'true');

  addTextElement(top, 'span', 'job-type', job.type || 'Job');
  card.appendChild(top);

  addTextElement(card, 'h3', '', job.title);
  addTextElement(card, 'div', 'company-line', `${job.company} · ${job.location}`);

  const tags = document.createElement('div');
  tags.className = 'job-tags';
  addTextElement(tags, 'span', 'job-tag', job.experience || 'Experience not specified');
  addTextElement(tags, 'span', 'job-tag', job.location);
  card.appendChild(tags);

  addTextElement(card, 'div', 'job-pay', job.pay || 'Pay not specified');
  addTextElement(card, 'p', 'job-description', job.description || '');

  return card;
}

function matchesLocation(job, selected) {
  if (selected === 'all') return true;

  const location = String(job.location || '').toLowerCase();

  if (selected === 'Other') {
    return ![
      'new york',
      'remote',
      'kenya',
      'united states',
      'united kingdom'
    ].includes(location);
  }

  return location.includes(selected.toLowerCase());
}

function renderJobs() {
  const query = searchInput.value.trim().toLowerCase();
  const selectedLocation = locationFilter.value;
  const selectedType = typeFilter.value;
  const selectedExperience = experienceFilter.value;

  const filtered = jobs.filter((job) => {
    const searchable = `${job.title} ${job.company} ${job.location} ${job.description}`.toLowerCase();

    return (!query || searchable.includes(query)) &&
      matchesLocation(job, selectedLocation) &&
      (selectedType === 'all' || job.type === selectedType) &&
      (selectedExperience === 'all' || job.experience === selectedExperience);
  });

  jobList.replaceChildren();
  resultsCount.textContent = `${filtered.length} ${filtered.length === 1 ? 'opportunity' : 'opportunities'}`;

  if (!filtered.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'No jobs match those filters yet. Try a different search.';
    jobList.appendChild(empty);
    return;
  }

  filtered.forEach((job) => jobList.appendChild(createJobCard(job)));
}

jobForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const newJob = {
    id: `local-${Date.now()}`,
    title: document.getElementById('job-title').value.trim(),
    company: document.getElementById('job-company').value.trim(),
    location: document.getElementById('job-location').value.trim(),
    type: document.getElementById('job-type').value,
    experience: document.getElementById('job-experience').value,
    pay: document.getElementById('job-pay').value.trim() || 'Pay not specified',
    email: document.getElementById('job-email').value.trim(),
    description: document.getElementById('job-description').value.trim()
  };

  if (
    !newJob.title ||
    !newJob.company ||
    !newJob.location ||
    !newJob.type ||
    !newJob.experience ||
    !newJob.email ||
    !newJob.description
  ) {
    formMessage.textContent = 'Please complete all required fields.';
    return;
  }

  jobs.unshift(newJob);

  try {
    const userJobs = jobs.filter((job) => String(job.id).startsWith('local-'));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userJobs));

    formMessage.textContent = 'Your demo listing has been saved in this browser.';
    jobForm.reset();

    searchInput.value = '';
    locationFilter.value = 'all';
    typeFilter.value = 'all';
    experienceFilter.value = 'all';

    renderJobs();
    document.getElementById('jobs').scrollIntoView({ behavior: 'smooth' });
  } catch (error) {
    jobs = jobs.filter((job) => job.id !== newJob.id);
    formMessage.textContent = 'This browser could not save the listing. Please try again.';
    console.error('Could not save listing:', error);
  }
});

[searchInput, locationFilter, typeFilter, experienceFilter].forEach((control) => {
  control.addEventListener(
    control === searchInput ? 'input' : 'change',
    renderJobs
  );
});

document.getElementById('year').textContent = new Date().getFullYear();
renderJobs();
