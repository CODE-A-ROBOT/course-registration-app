let data; // Declare the data variable
var subjectsMap = [];
var groupsMap = [];
var reverseGroupsMap = new Map();
var replacedSelectsMap = [];
var dataReplaced = [];

// Function to replace the placeholder in a specified column
const expandPlaceholderInColumn = (row, column, placeholder) => {
  if (row[column] === placeholder) {
    // Assuming subjectsMap is created during fetchSubjects
    const subjectList = subjectsMap.get(placeholder).split(',');

    if (subjectList && Array.isArray(subjectList)) {
      const newRows = [];
      subjectList.forEach(subject => {
        const newRow = { ...row, [column]: subject };
        //console.log(`@@ newRow.${column}: ${newRow[column]} for placeholder: ${placeholder}`);
        newRows.push(newRow);
      });
      return newRows;
    } else {
      console.error(`Invalid or missing subjectList for "${placeholder}" in column "${column}".`);
    }
  }
  return [row]; // If no replacement needed, return the original row
};

const duplicateColumn1And2Switched = (rows, column1Select, column2Select) => {
  const newRows = [];
  rows.forEach(row => {
    // Create a new row with values switched
    const newRow = { ...row, [column1Select]: row[column2Select], [column2Select]: row[column1Select] };
    console.log('@@ row:', row);
    console.log('@@ newRow:', newRow);
    newRows.push(row);
    newRows.push(newRow);
  });
  return newRows;
}

// Function to createSubjectsDropdown, replace this with your actual implementation
function createSubjectsDropdownLabel(labelId, label) {
  const subjectsDropdown = document.createElement('select');
  const subjectsDropdownId = `${labelId}-dropdown`;

  subjectsDropdown.id = subjectsDropdownId;

  // Customize the subjectsDropdown as needed

  // For example, adding options:
  const subjects = subjectsMap.get(label).split(',');
  subjects.forEach(subject => {
    const option = document.createElement('option');
    option.value = subject;
    option.textContent = subject;
    subjectsDropdown.appendChild(option);
  });

  return subjectsDropdown;
}

// New function to fetch and parse subjects.json
async function fetchSubjects() {
  try {
    const response = await fetch('subjects.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch subjects.json. Status: ${response.status}`);
    }
    subjectsMap = new Map((await response.json()).map(item => [item.label, item.subjects]));


    // Iterate through all labels
    for (let i = 1; i <= 14; i++) {
      const labelId = `column${i}SelectLabel`;
      const labelValue = document.getElementById(labelId)?.innerText.trim();

      if (labelValue && subjectsMap.has(labelValue)) {
        // If the label is in subjectsMap, createSubjectsDropdown for label
        const subjectsDropdown = createSubjectsDropdownLabel(labelId, labelValue);
        // Append the subjectsDropdown to the appropriate container in your HTML
        // For example, if you have a container with id 'subjectsDropdownContainer':
        const container = document.getElementById(labelId).parentNode;
        container.appendChild(subjectsDropdown);
      }
    }


    const response1 = await fetch('groups.json');
    if (!response1.ok) {
      throw new Error(`Failed to fetch groups.json. Status: ${response1.status}`);
    }
    groupsMap = new Map((await response1.json()).map(item => [item.group, item.subjects]));
    // Create a reverseGroupMap
    //reverseGroupMap = new Map();

    // Iterate over each entry in groupsMap
    groupsMap.forEach((subjects, group) => {
      // Split subjects string into an array
      const subjectsArray = subjects.split(', ');

      // Iterate over subjects and add reverse mapping to the reverseGroupMap
      subjectsArray.forEach(subject => {
        reverseGroupsMap.set(subject, group);
      });
    });

    console.log(reverseGroupsMap);

    const response2 = await fetch('data.json');
    if (!response2.ok) {
      throw new Error(`Failed to fetch data.json. Status: ${response2.status}`);
    }
    data = await response2.json();
    //console.log('@@ data:', data);
    
    // Process data and create dataReplaced
    //let dataReplaced = [];
      data.forEach(row => {
        // Replace '*' in column5Select
      const rowsAfterStarReplacement = expandPlaceholderInColumn(row, 'column5Select', '*');

    
      // Replace '+' in column14Select for each row produced in the first iteration
      rowsAfterStarReplacement.forEach(newRow => {
        const rowsAfterPlusReplacement = expandPlaceholderInColumn(newRow, 'column14Select', '+');
    
        const rowsAfterDuplicate = duplicateColumn1And2Switched(rowsAfterPlusReplacement, 'column1Select', 'column2Select')

        dataReplaced = dataReplaced.concat(rowsAfterDuplicate);
      });



    });
    
    //console.log('@@ dataReplaced:', dataReplaced);
  

  } catch (error) {
    console.error(error);
  }
}



// Updated fetchCourses function
async function fetchCourses() {
  try {
    
    await fetchSubjects(); // Fetch subjects first

    // Fetch and populate the School select
    fetchAndPopulateSelect('schoolSelect', dataReplaced);
  } catch (error) {
    console.error(error);
  }
}

// Updated fetchAndPopulateSelect function
function fetchAndPopulateSelect(selectId, dataReplaced) {
    //console.log('fetchAndPopulateSelect:  dataReplaced:', dataReplaced);

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
    if (selectId === 'column14Select') {
      column14Select.size = column14Select.options.length;
    }
  
    // Set up an event listener to hide/show subjects dropdowns based on the selected value
    select.addEventListener('change', () => {
      subjectsMap.forEach((_, value) => {
        const subjectsDropdownId = `${selectId}-${value}-subjects-dropdown`;
        const subjectsDropdown = document.getElementById(subjectsDropdownId);
  
        if (subjectsDropdown) {
          subjectsDropdown.style.display = select.value === value ? 'inline-block' : 'none';
          //console.log('Selected Value:', select.value);
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
    label.style.display = 'none'; // Initially hide the subjects dropdown
    parentNode.appendChild(label);
  
    // Add subject dropdowns to the subjects dropdown if the subject is again in subjectsMap
    subjects.split(',').forEach(subject => {
      const subjectValue = subject.trim();
      //console.log('createSubjectsDropdown subjectValue: ' + subjectValue);
      if (subjectsMap.has(subjectValue)) {
        //console.log('subjectsMap.has(subjectValue): ' + subjectValue);
  
        const nestedSubjectsDropdown = createSubjectsDropdown(subjectValue, subjectsMap.get(subjectValue), subjectsDropdownId, parentNode);
        if (nestedSubjectsDropdown) {
          //console.log('subjectsDropdown:', subjectsDropdown);
          //console.log('parentNode:', parentNode);
  
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
          //console.log('Selected Value:', subjectsDropdown.value);
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
  
    const quarters = 4; // Move quarters outside the loop if it remains constant
    const multiFieldSelection = [];
    
    let count = 0;

      for (let i = 1; i <= 14; i++) {
        const selectId = `column${i}Select`;
        const labelId = `column${i}SelectLabel`;
        const subjectsDropdownId = `${labelId}-dropdown`;

        const selectedValue = document.getElementById(selectId).value;
        const labelValue = document.getElementById(labelId).innerText.trim();
        const labelText = document.getElementById(labelId).textContent;
    
        if (i === 14) {
          // Addtitional courses
          // Special handling for the 14th iteration with a multi-select element
          const selectedOptions = Array.from(document.getElementById(selectId).selectedOptions).map(option => option.value);

          selectedOptions.forEach(option => {
            option = option.trim();

            group1 = reverseGroupsMap.get(option);
            if (! group1) {
              console.log('group1 for: ' + option + ': ' + group1);
            }

            multiFieldSelection.push({
              label: '',
              group: `${reverseGroupsMap.get(option)}`,
              value: `${labelValue} ${option}`,
              patern: displayXPattern(quarters),
              quarter: quarters
            });
            count = count + quarters;
            console.log(`1group: ${reverseGroupsMap.get(option)}, label: '', value: ${labelValue} + ' ' + ${option}, quarter: ${quarters}`);
          });
        } else if (subjectsMap.has(selectedValue)) {
          const subjectsSelectId = `${selectId}-${selectedValue}-subjects-dropdown`;
          const subjectsLabelId = `${selectId}-${selectedValue}-label`;
    
          const subjectsLabelValue = document.getElementById(subjectsLabelId)?.innerText.trim();
          const subjectsSelectedValue = document.getElementById(subjectsSelectId).value;
          let group2 = reverseGroupsMap.get(selectedValue);
          if (! group2) {
             group2 = reverseGroupsMap.get(subjectsLabelValue);
          }
          if (subjectsSelectedValue) {
            multiFieldSelection.push({
              label: labelValue,
              group: `${group2}`,
              value: `${subjectsSelectedValue}`,
              patern: displayXPattern(quarters),
              quarter: quarters
            });
            count = count + quarters;

            console.log(`2group: ${group2}, label: ${labelValue}, value: ${subjectsSelectedValue}, patern: ${displayXPattern(quarters)}, quarter: ${quarters}`);

          }
        } else {
          if (selectedValue.length > 3) {
            //is course
            multiFieldSelection.push({
              label: labelValue,
              group: `${reverseGroupsMap.get(selectedValue)}`,
              value: selectedValue,
              patern: displayXPattern(quarters),
              quarter: quarters
            });
            count = count + quarters;

            console.log(`3group: ${reverseGroupsMap.get(selectedValue)}, label: ${labelValue}, value: ${selectedValue}, quarter: ${quarters}`);

          }
          else {
            // Courses Count
            // is hours
            const parsedCnt = parseValue(selectedValue);
            console.log(`parsedCnt: ${parsedCnt}`);

            //const origLabelValue = document.getElementById(labelId).value;
            //const labelValue = document.getElementById(labelId).innerText.trim();

            const labelSelect = document.getElementById(subjectsDropdownId);
            const labelSelectValue = (labelSelect) ? labelSelect.value : labelText;

            //console.log('444: labelValue : ' + labelValue);
            //console.log('444: labelSelectValue: ' + labelSelectValue);

            let group4 = reverseGroupsMap.get(labelText);
            console.log('group4 for: ' + labelText + ': ' + group4);

            if (! group4) {
               group4 = reverseGroupsMap.get(labelSelectValue);
               console.log('group4 for: ' + labelSelectValue + ': ' + group4);
            }
   
            multiFieldSelection.push({
              label: '',
              group: `${group4}`,
              value: '' + labelSelectValue,
              patern: displayXPattern(parsedCnt),
              quarter: selectedValue
            });



            count = count + parsedCnt;

            console.log(`4group: ${group4}, label: '', value: ${labelSelectValue}, quarter: ${selectedValue}`);
          }
        }


    
      // Assuming you have a textarea with id 'selectedCoursesTextarea'
      //const textarea = document.getElementById('selectedCoursesTextarea');
      //textarea.value = JSON.stringify(multiFieldSelection, null, 2);
      
      // Additional code for submitting the form if needed
      // document.forms["yourFormName"].submit();
    }
    

    console.log(`count: ${count}`);
    multiFieldSelection.push({
      label: '',
      group: 'Total',
      value: '',
      patern: displayXPattern(''),
      quarter: count
    });


    // Push the accumulated values into the selectedCourses array
    selectedCourses.push(multiFieldSelection);
    
    
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

  function parseValue(selectedValue) {
    const valueWithoutParentheses = selectedValue.replace(/[()]/g, ''); // Remove parentheses
    return isNaN(valueWithoutParentheses) ? 0 : parseFloat(valueWithoutParentheses);
  }

  function displayXPattern(value) {
    if (value === 4) {
      return 'X     X     X     X';
    } else if (value === 2) {
      return 'X     X                  ';
    } else {
      return '                         ';
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