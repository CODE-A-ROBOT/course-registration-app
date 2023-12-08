let data; // Declare the data variable
let subjectsMap;

// New function to fetch and parse subjects.json
async function fetchSubjects() {
  try {
    const response = await fetch('subjects.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch subjects.json. Status: ${response.status}`);
    }
    subjectsMap = new Map((await response.json()).map(item => [item.label, item.subjects]));

  } catch (error) {
    console.error(error);
  }
}


// Updated fetchCourses function
async function fetchCourses() {
try {
await fetchSubjects(); // Fetch subjects first

const response = await fetch('data.json');
if (!response.ok) {
  throw new Error(`Failed to fetch data.json. Status: ${response.status}`);
}
data = await response.json();


// Fetch and populate the School select
fetchAndPopulateSelect('schoolSelect', data);
} catch (error) {
console.error(error);
}
}

// Updated fetchAndPopulateSelect function
function fetchAndPopulateSelect(selectId, data) {
const select = document.getElementById(selectId);

// Clear existing options
select.innerHTML = '';

// Create the default option for the school dropdown
if (selectId === 'schoolSelect') {
const defaultOption = document.createElement('option');
defaultOption.value = '';
defaultOption.text = 'Select...';
select.appendChild(defaultOption);
}

const uniqueValues = [...new Set(data.map(item => item[selectId]))];
uniqueValues.forEach(value => {
/*
if (value === '*') {
  console.log("value is *");
  const origs = subjectsMap.get('*');
  // Create options for subjects dropdown
  origs.split(',').forEach(subject => {
    const option = document.createElement('option');
    option.value = subject.trim();
    option.text = subject.trim();
    select.appendChild(option);
  });

} else {
  const option = document.createElement('option');
  option.value = value;
  option.text = value;
  select.appendChild(option);
}
*/
const option = document.createElement('option');
option.value = value;
option.text = value;
select.appendChild(option);
});
// Create and append subjects dropdowns for all values in subjectsMap
subjectsMap.forEach((subjects, value) => {
const subjectsDropdown = createSubjectsDropdown(value, subjects, selectId, select.parentNode);
if (subjectsDropdown) {
  console.log('select.parentNode:', select.parentNode);

  select.parentNode.appendChild(subjectsDropdown);
}
});

// Set up an event listener to hide/show subjects dropdowns based on the selected value
select.addEventListener('change', () => {
subjectsMap.forEach((_, value) => {
  const subjectsDropdownId = `${selectId}-${value}-subjects-dropdown`;
  const subjectsDropdown = document.getElementById(subjectsDropdownId);

  if (subjectsDropdown) {
    subjectsDropdown.style.display = select.value === value ? 'inline-block' : 'none';
    console.log('Selected Value:', select.value);
  }
});
});
}

// Updated createSubjectsDropdown function
function createSubjectsDropdown(value, subjects, selectId, parentNode) {
const subjectsDropdownId = `${selectId}-${value}-subjects-dropdown`;

console.log(`Creating subjects dropdown for ${selectId} with value ${value}`);
const subjectsDropdown = document.createElement('select');
subjectsDropdown.classList.add('subjects-dropdown');
subjectsDropdown.id = subjectsDropdownId;
subjectsDropdown.style.display = 'none'; // Initially hide the subjects dropdown

// Create options for subjects dropdown
subjects.split(',').forEach(subject => {
const option = document.createElement('option');
option.value = subject.trim();
option.text = subject.trim();

subjectsDropdown.appendChild(option);
});

// Add subject dropdowns to the subjects dropdown if the subject is again in subjectsMap
subjects.split(',').forEach(subject => {
const subjectValue = subject.trim();
console.log('createSubjectsDropdown subjectValue: ' + subjectValue);
if (subjectsMap.has(subjectValue)) {
  console.log('subjectsMap.has(subjectValue): ' + subjectValue);

  const nestedSubjectsDropdown = createSubjectsDropdown(subjectValue, subjectsMap.get(subjectValue), subjectsDropdownId, parentNode);
  if (nestedSubjectsDropdown) {
    console.log('subjectsDropdown:', subjectsDropdown);
    console.log('parentNode:', parentNode);

    parentNode.appendChild(nestedSubjectsDropdown);
  }
}
});

// Set up an event listener to hide/show subjects dropdowns based on the selected value
subjectsDropdown.addEventListener('change', () => {
subjectsMap.forEach((_, value) => {
  const nestedSubjectsDropdownId = `${selectId}-${value}-subjects-nesteddropdown`;
  const nestedSubjectsDropdown = document.getElementById(nestedSubjectsDropdownId);

  if (nestedSubjectsDropdown) {
    nestedSubjectsDropdown.style.display = select.value === value ? 'inline-block' : 'none';
    console.log('Selected Value:', subjectsDropdown.value);
  }
});
});

return subjectsDropdown;
}



// Fetch courses and subjects when the page loads
document.addEventListener('DOMContentLoaded', fetchCourses);

// Additional function to submit the form
function submitForm() {
  // Add your logic to handle the selected values (e.g., send them to the server)
  // Access the selected values using document.getElementById('selectId').value
  console.log('Form submitted!');
}

// Function to filter options and update dropdowns
async function filterOptions(sourceSelectId, targetSelectId) {
  const sourceSelect = document.getElementById(sourceSelectId);
  const targetSelect = document.getElementById(targetSelectId);

  // Get the selected value from the source select
  const selectedValue = sourceSelect.value;

  // Filter the data based on the selected value
  const filteredData = data.filter(item => item[sourceSelectId] === selectedValue);

  // Repopulate the target select with the first available option
  fetchAndPopulateSelect(targetSelectId, filteredData);

  // Trigger change event for the target select to continue the cascade
  const event = new Event('change');
  targetSelect.dispatchEvent(event);
}