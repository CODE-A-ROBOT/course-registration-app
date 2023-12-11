let data; // Declare the data variable
let subjectsMap = [];
var replacedSelectsMap = [];
var dataReplaced = [];

// Function to replace the placeholder in a specified column
const replacePlaceholderInColumn = (row, column, placeholder) => {
  if (row[column] === placeholder) {
    // Assuming subjectsMap is created during fetchSubjects
    const subjectList = subjectsMap.get(placeholder).split(',');

    if (subjectList && Array.isArray(subjectList)) {
      const newRows = [];
      subjectList.forEach(subject => {
        const newRow = { ...row, [column]: subject };
        console.log(`@@ newRow.${column}: ${newRow[column]} for placeholder: ${placeholder}`);
        newRows.push(newRow);
      });
      return newRows;
    } else {
      console.error(`Invalid or missing subjectList for "${placeholder}" in column "${column}".`);
    }
  }
  return [row]; // If no replacement needed, return the original row
};


// New function to fetch and parse subjects.json
async function fetchSubjects() {
  try {
    const response = await fetch('subjects.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch subjects.json. Status: ${response.status}`);
    }
    subjectsMap = new Map((await response.json()).map(item => [item.label, item.subjects]));
    //subjectsMap = new Map((await response.json()).map(item => [item.label, item.subjects.split(',').map(subject => subject.trim())]));
    //console.log('@@ subjectsMap:', subjectsMap);
    const response2 = await fetch('data.json');
    if (!response2.ok) {
      throw new Error(`Failed to fetch data.json. Status: ${response.status}`);
    }
    data = await response2.json();
    //console.log('@@ data:', data);
    
    // Process data and create dataReplaced
    //let dataReplaced = [];
      data.forEach(row => {
        // Replace '*' in column5Select
      const rowsAfterStarReplacement = replacePlaceholderInColumn(row, 'column5Select', '*');
      
      // Log what is being added for '*' replacement
      rowsAfterStarReplacement.forEach(newRow => {
        console.log(`Adding row after '*' replacement: ${JSON.stringify(newRow)}`);
      });
    
      // Replace '+' in column14Select for each row produced in the first iteration
      rowsAfterStarReplacement.forEach(newRow => {
        const rowsAfterPlusReplacement = replacePlaceholderInColumn(newRow, 'column14Select', '+');
    
        // Log what is being added for '+' replacement
        rowsAfterPlusReplacement.forEach(finalRow => {
          console.log(`Adding row after '+' replacement: ${JSON.stringify(finalRow)}`);
        });
    
        dataReplaced = dataReplaced.concat(rowsAfterPlusReplacement);
      });
    });
    
    console.log('@@ dataReplaced:', dataReplaced);
  

  } catch (error) {
    console.error(error);
  }
}



// Updated fetchCourses function
async function fetchCourses() {
  try {
    
    await fetchSubjects(); // Fetch subjects first
/*
    const response = await fetch('dataReplaced.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch dataReplaced.json. Status: ${response.status}`);
    }
    data = await response.json();

    */
    // Fetch and populate the School select
    fetchAndPopulateSelect('schoolSelect', dataReplaced);
  } catch (error) {
    console.error(error);
  }
}

// Updated fetchAndPopulateSelect function
function fetchAndPopulateSelect(selectId, dataReplaced) {
  console.log('fetchAndPopulateSelect:  dataReplaced:', dataReplaced);

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
  
    const uniqueValues = [...new Set(dataReplaced.map(item => item[selectId]))];
/*
    // Check for '*' and replace with subjects from subjectsMap.get('*')
    if (uniqueValues.includes('*')) {
      //const replaceVals = subjectsMap.get('*');
      //uniqueValues = [ ...replaceVals.split(',')];

      uniqueValues = [...subjectsMap.get('*').split(',')];
      //console.log('@@ replacedSelectsMap:', replacedSelectsMap);
    }
  
    // Check for '+' and replace with subjects from subjectsMap.get('+')
    if (uniqueValues.includes('+')) {
      //const replaceVals = subjectsMap.get('+');
      //uniqueValues = [ ...replaceVals.split(',')];
      uniqueValues = subjectsMap.get('+');

      //console.log('@@ replacedSelectsMap:', replacedSelectsMap);

    }
*/
    uniqueValues.forEach(value => {
      const option = document.createElement('option');
      option.value = value;
      option.text = value;
      select.appendChild(option);

      // Add subjects dropdown for the value if available
      if (subjectsMap.get(value)) {
          const subjectsDropdown = createSubjectsDropdown(value, subjectsMap.get(value), selectId, select.parentNode);
          if (subjectsDropdown) {
          select.parentNode.appendChild(subjectsDropdown);
          }
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
    // uniqueValues = [...new Set(dataReplaced.map(item => item[selectId]))];
    // //console.log('@@ uniqueValues after after replace:', uniqueValues);

  }
  
// Updated createSubjectsDropdown function
function createSubjectsDropdown(value, subjects, selectId, parentNode) {
    const subjectsDropdownId = `${selectId}-${value}-subjects-dropdown`;
    const labelId = `${selectId}-label`;
  
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
  
    // Create a label element for the dropdown
    const label = document.createElement('label');
    label.id = labelId;
    label.innerText = `${value}: `;
    parentNode.appendChild(label);
  
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
          nestedSubjectsDropdown.style.display = subjectsDropdown.value === value ? 'inline-block' : 'none';
          console.log('Selected Value:', subjectsDropdown.value);
        }
      });
    });
  
    return subjectsDropdown;
  }
  
  
  // Fetch courses and subjects when the page loads
document.addEventListener('DOMContentLoaded', fetchCourses);



function submitForm() {
    // Add your logic to handle the selected values (e.g., send them to the server)
    // Access the selected values using document.getElementById('selectId').value
    console.log('Form submitted!');
  
    const selectedCourses = [];
  
    for (let i = 1; i <= 14; i++) {
      const selectId = `column${i}Select`;
      const labelId =  `column${i}SelectLabel`;

      const selectedValue = document.getElementById(selectId).value;
      const labelValue = document.getElementById(labelId).innerText.trim();
  
      console.log(`Selected value for ${labelId}: ${selectedValue}`);
      //console.log(`Label value for ${labelId}-label: ${labelValue}`);
  
      //selectedCourses.push({ [labelValue]: selectedValue });
  
      if (subjectsMap.has(selectedValue)) {
        const subjectsSelectId = `${selectId}-${selectedValue}-subjects-dropdown`;
        const subjectsLabelId = `${selectId}-${selectedValue}-label`;
  
        console.log(`Selected value for ${subjectsSelectId}: ${document.getElementById(subjectsSelectId).value}`);
  
        // Additional debug message for subjectsLabelId
        //console.log(`Label ID for ${subjectsSelectId}: ${subjectsLabelId}`);
  
        const subjectsLabelValue = document.getElementById(subjectsLabelId)?.innerText.trim();
  
        // Additional debug message for subjectsLabelValue
        //console.log(`Label value for ${subjectsLabelId}: ${subjectsLabelValue}`);
  
        const subjectsSelectedValue = document.getElementById(subjectsSelectId).value;
  
        if (subjectsSelectedValue) {
            //selectedCourses.push({ [subjectsLabelValue]: subjectsSelectedValue });
            selectedCourses.push({ [labelValue]: selectedValue + ': '+ subjectsSelectedValue });
        }
      }
      else {
        selectedCourses.push({ [labelValue]: selectedValue });

      }
    }
    
    const selectedCoursesJSON = JSON.stringify(selectedCourses);

    // Open a new window with the summary
    const summaryWindow = window.open('summary.html');
    
    // Check if the window is opened successfully
    if (summaryWindow) {
      // Pass the selected courses as a query parameter
      summaryWindow.location.href = `summary.html?selectedCourses=${encodeURIComponent(selectedCoursesJSON)}`;
    } else {
      console.error('Failed to open summary window');
    }
  }
  
  
  

// Function to filter options and update dropdowns
async function filterOptions(sourceSelectId, targetSelectId) {
  let sourceSelect = document.getElementById(sourceSelectId);
  const targetSelect = document.getElementById(targetSelectId);

  // Get the selected value from the source select
  let selectedValue = sourceSelect.value;

  // Filter the data based on the selected value
  const filteredData = dataReplaced.filter(item => item[sourceSelectId] === selectedValue);


  if (selectedValue === 'columnSelect3')  {
    //console.log(`Label ID for ${subjectsSelectId}: ${subjectsLabelId}`);

  }


  // Repopulate the target select with the first available option
  fetchAndPopulateSelect(targetSelectId, filteredData);

  // Trigger change event for the target select to continue the cascade
  const event = new Event('change');
  targetSelect.dispatchEvent(event);
}