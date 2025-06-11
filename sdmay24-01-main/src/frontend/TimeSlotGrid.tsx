import React, { useState, useEffect } from 'react';
import NavBar from './NavBar';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Select, InputLabel, MenuItem } from '@material-ui/core';
import './App.css';
/* In this code, we're using the useState hook to manage the tabs and the active tab. 
The addTab function is used to add a new tab when the "+" button is clicked, and the closeTab function
 is used to close a tab when the "x" button on a tab is clicked. 
 The stopPropagation method is used to prevent the click event on the "x" button from also triggering the click event on the tab. 
 the grids state variable is an object where the keys are tab IDs and the values are objects that contain the days and times arrays for the tabs. The grid for the currently active tab is displayed in the render method. */

type Tab = {
  id: number;
  title: string;
  dayTimeSequence: string;
  avoidClasses: ClassData[];
  avoidCohorts: CohortData[];
  availabilityData?: []
};
type Reason = {
  className: string;
  section: string;
  availability: string;
};
interface AvailabilityDataItem {
  time: {
    day: string;
    startTime: string;
  };
  reasons: Reason[];
  availability: string;
}


type ClassData = {
  id: number;
  classDepartment: string;
  classNumber: string;
  percentage: number;
};

type CohortData = {
  id: number;
  program: string;
  semesterNumber: string;
  percentage: number;
};

type Grid = {
  days: string[];
  times: string[];
};

type Grids = {
  [key: number]: Grid;
};

const MWF_DAYS = ['Monday', 'Wednesday', 'Friday'];
const MWF_TIMES = ['7:45 am', '8:50 am', '9:55 am', '11:00 am', '12:05 pm', '1:10 pm', '2:15 pm', '3:20 pm', '4:25 pm', '5:30 pm'];

const TR_DAYS = ['Tuesday', 'Thursday'];
const TR_TIMES = ['8:00 am', '9:30 am', '11:00 am', '12:40 pm', '2:10 pm', '3:40 pm', '4:10 pm'];

function convertTo24Hour(time: string) {
  var [hours, minutes] = time.split(':');
  let [mins, period] = minutes.split(' ');

  if (period.toLowerCase() === 'pm') {
    if (hours !== '12') {
      hours = (parseInt(hours, 10) + 12).toString();
    }
  } else {
    if (hours === '12') {
      hours = '00';
    } else if (parseInt(hours, 10) < 10) {
      hours = '0' + hours;
    }
  }

  return `${hours}:${mins}`;
}


function exportToCSV(tabs: Tab[], grids: Grids) {
  const csvContent = "data:text/csv;charset=utf-8," +
    "Tab Title,Day,Time,Availability\n" +
    tabs.flatMap(tab =>
      grids[tab.id].days.flatMap(day =>
        grids[tab.id].times.map(time => {
          const currentStartTime = convertTo24Hour(time);
          const matchingAvailabilityData = (tab.availabilityData as AvailabilityDataItem[])?.find(
            item => item.time.day === day && item.time.startTime === currentStartTime
          );
          return [tab.title, day, time, matchingAvailabilityData ? matchingAvailabilityData.availability : ''];
        })
      )
    ).map(row => row.join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "schedule.csv");
  document.body.appendChild(link);
  link.click();
}

function TimeSlotGrid() {
  const [times, setTimes] = useState(['7:45 am', '8:50 am', '9:55 am', '11:00 am', '12:05 pm', '1:10 pm', '2:15 pm', '3:20 pm', '4:25 pm', '5:30 pm']);
  const [days, setDays] = useState(['Monday', 'Wednesday', 'Friday']);

  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTab, setActiveTab] = useState<number | null>(1);

  const [grids, setGrids] = useState<Grids>({ 1: { days, times } }); // Add state for the grids
  const [maxTabId, setMaxTabId] = useState(1);

  const [settingsOpen, setSettingsOpen] = useState(false);

  const [classData, setClassData] = useState<ClassData[]>([]);
  const [cohortData, setCohortData] = useState<CohortData[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedCohortId, setSelectedCohortId] = useState<number | null>(null);


  // Load the previous schedule data from the backend when the component mounts if it exists, otherwise load blank
  useEffect(() => {
    fetch('http://localhost:3001/schedule')
      .then(response => response.json())
      .then(data => {
        if (data.length === 0) {
          setTabs([{ id: 1, title: 'Tab 1', dayTimeSequence: '', avoidClasses: [], avoidCohorts: [], availabilityData: [] }]);
          setActiveTab(1);
          setGrids({ 1: { days: MWF_DAYS, times: MWF_TIMES } });
        } else {
          setTabs(data);
          const highestId = Math.max(...data.map((tab: Tab) => tab.id));
          console.log('Highest ID:', highestId);
          setActiveTab(1);
          data.forEach((tab: Tab) => {

            const days = tab.dayTimeSequence === 'MWF' ? MWF_DAYS : TR_DAYS;
            const times = tab.dayTimeSequence === 'MWF' ? MWF_TIMES : TR_TIMES;
            setGrids(prevGrids => ({
              ...prevGrids,
              [tab.id]: { days: days, times: times }
            }));
            fetch('http://localhost:3001/availability', { //get availability for the already loaded classes
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                cohorts: tab.avoidCohorts,
                classes: tab.avoidClasses})
            })
              .then(response => response.json())
              .then(data => {
                setTabs(prevTabs => {
                  const newTabs = [...prevTabs];
                  const selectedTab = newTabs.find(t => t.id === tab.id);
                  if (selectedTab) {
                    selectedTab.availabilityData = data;
                  }
                  return newTabs;
                });
              })
              .catch((error) => {
                console.error('Error:', error);
              }); 
            setMaxTabId(tab.id);
          });
        }
      })
      .catch(error => {
        console.error('Error fetching schedule:', error);
      });
  }, []); // Empty dependency array means it only runs on load. 

  // This effect runs when the activeTab or tabs state changes
  useEffect(() => {

    // Fetch the class data from the backend
    fetch('http://localhost:3001/class/unique')
      .then(response => response.json())
      .then(data => {
        // Map the fetched data to the ClassData type and set it in the state
        const classDataArray: ClassData[] = data.map((item: any) => ({
          id: item.id,
          classDepartment: item.classDepartment,
          classNumber: item.classNumber,
          percentage: 100
        }));
        setClassData(classDataArray);
      })
      .catch(error => console.error('Error:', error));

    // Fetch the cohort data from the backend
    fetch('http://localhost:3001/cohort')
      .then(response => response.json())
      .then(data => {
        const cohorts = data.map((cohort: any) => ({
          id: cohort.id,
          program: cohort.program,
          semesterNumber: cohort.semesterNumber,
          classes: cohort.classes,
          percentage: 100
        }));
        setCohortData(cohorts);
      })
      .catch(error => console.error('Error:', error));
  }, [activeTab, tabs]);

  const addTab = () => {
    const newId = maxTabId + 1; // Increment the maxTabId to get a new unique ID
    const newTab: Tab = {
      id: newId,
      title: `Tab ${newId}`,
      dayTimeSequence: 'MWF',
      avoidClasses: [],
      avoidCohorts: [],
      availabilityData: []
    };
    setTabs([...tabs, newTab]);
    setActiveTab(newId);
    setGrids({ ...grids, [newId]: { days: MWF_DAYS, times: MWF_TIMES } });
    setMaxTabId(newId); // Update the maxTabId with the new ID
  };
  //close
  const closeTab = (id: number) => {
    // Prevent the last tab from being closed
    if (tabs.length === 1) {
      alert("ERROR: At least one tab must remain open.");
      return;
    }

    // Remove the tab with the given id from the tabs state
    const filteredTabs = tabs.filter(tab => tab.id !== id);
    setTabs(filteredTabs);

    // If the tab being closed is the active tab, set the first tab in the filtered list as the new active tab
    // If there are no other tabs, set the active tab to null
    if (activeTab === id) {
      const nextActiveTab = filteredTabs.length > 0 ? filteredTabs[0].id : null;
      setActiveTab(nextActiveTab);
    }

    // Remove the grid for the tab with the given id from the grids state
    const { [id]: _, ...newGrids } = grids;
    setGrids(newGrids);

    // Call deleteSchedule with the id of the tab being closed
    deleteSchedule(id.toString());

    // Decrease the maxTabId value by one
    setMaxTabId(maxTabId - 1);
  };
  //delete the tab from the database
  const deleteSchedule = (id: string) => {
    fetch(`http://localhost:3001/schedule/${id}`, {
      method: 'DELETE'
    })
      .then(response => {
        if (response.ok) {
          console.log('Schedule deleted successfully');
        } else {
          console.error('Failed to delete schedule');
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };
  // Handler for opening the settings dialog
  const handleSettingsOpen = () => {
    if (activeTab !== null) {
      // Get the current grid for the active tab
      const currentGrid = grids[activeTab];
      // Check if the current grid matches the MWF or TR schedule and set the dayTimeSequence accordingly
      if (currentGrid.days.length === MWF_DAYS.length && currentGrid.times.length === MWF_TIMES.length) {
        setTabs(tabs.map(tab => tab.id === activeTab ? { ...tab, dayTimeSequence: 'MWF' } : tab));
      } else if (currentGrid.days.length === TR_DAYS.length && currentGrid.times.length === TR_TIMES.length) {
        setTabs(tabs.map(tab => tab.id === activeTab ? { ...tab, dayTimeSequence: 'TR' } : tab));
      }
    }
    // Open the settings dialog
    setSettingsOpen(true);
  };

  // Handler for closing the settings dialog
  const handleSettingsClose = () => {
    setSettingsOpen(false);
  };


  // Handler for submitting the settings
  const handleSettingsSubmit = () => {
    // Find the currently active tab
    const selectedTab = tabs.find(tab => tab.id === activeTab);
    console.log('Selected tab:', selectedTab?.title);
    console.log('Selected day and time sequence:', tabs.find(tab => tab.id === activeTab)?.dayTimeSequence);

    if (selectedTab) {
      const data = {
        cohorts: selectedTab.avoidCohorts,
        classes: selectedTab.avoidClasses
      };

      fetch('http://localhost:3001/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
        .then(response => response.json())
        .then(data => {
          setTabs(prevTabs => {
            const newTabs = [...prevTabs];
            const selectedTab = newTabs.find(tab => tab.id === activeTab);
            if (selectedTab) {
              selectedTab.availabilityData = data;
            }
            return newTabs;
          });
        })
        .catch((error) => {
          console.error('Error:', error);
        });

      fetch('http://localhost:3001/schedule/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(selectedTab)
      })
        .catch((error) => {
          console.error('Error:', error);
        });
    }

    // Initialize newDays and newTimes with the current days and times
    let newDays: string[] = days, newTimes: string[] = times;
    const activeTabDayTimeSequence = tabs.find(tab => tab.id === activeTab)?.dayTimeSequence;
    console.log('Active tab dayTimeSequence:', activeTabDayTimeSequence);
    // If the active tab's dayTimeSequence is 'MWF', set newDays and newTimes to the MWF schedule
    if (activeTabDayTimeSequence === 'MWF') {
      newDays = MWF_DAYS;
      newTimes = MWF_TIMES;
    }
    // If the active tab's dayTimeSequence is 'TR', set newDays and newTimes to the TR schedule
    else if (activeTabDayTimeSequence === 'TR') {
      newDays = TR_DAYS;
      newTimes = TR_TIMES;
    }

    setDays(newDays);
    setTimes(newTimes);

    // If there is an active tab, update the grids state with the new days and times for the active tab
    if (activeTab !== null) {
      setGrids(prevGrids => ({
        ...prevGrids,
        [activeTab]: { days: newDays, times: newTimes }
      }));
    }

    // If there is an active tab, update the tabs state with the new tab name for the active tab
    // and update the grids state with the new days and times for the active tab
    if (activeTab !== null) {
      setTabs(prevTabs => prevTabs.map(tab => tab.id === activeTab ? { ...tab, nameChange: tab.title, title: tab.title } : tab));
      setGrids(prevGrids => ({
        ...prevGrids,
        [activeTab]: { days: newDays, times: newTimes }
      }));
    }

    // Close the settings dialog
    handleSettingsClose();
    };
    // Handler for changing the selected class
    const handleClassChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedClassId(event.target.value as number);
    };

    // Handler for adding a class to the avoidClasses array of the active tab
    const handleAddClass = () => {
    // Find the selected class in the classData array
    const selectedClass = classData.find(classItem => classItem.id === selectedClassId);

    if (selectedClass) {
      // Add the selected class to the avoidClasses array of the active tab
      const updatedTabs = tabs.map(tab => {
        if (tab.id === activeTab) {
          // Avoid mutating the original tab object by creating a new one
          return {
            ...tab,
            avoidClasses: [...tab.avoidClasses, selectedClass]
          };
        } else {
          return tab;
        }

      });

      // Update the tabs state with the updated tabs array
      setTabs(updatedTabs);
      // Clear the selected class
      setSelectedClassId(null);
    }
    };
    const handleAddCohort = () => {
    // Find the selected cohort in the cohortData array
    const selectedCohort = cohortData.find(cohortItem => cohortItem.id === selectedCohortId);

    if (selectedCohort) {
      // Add the selected cohort to the avoidCohorts array of the active tab
      const updatedTabs = tabs.map(tab => {
        if (tab.id === activeTab) {
          // Avoid mutating the original tab object by creating a new one
          return {
            ...tab,
            avoidCohorts: [...tab.avoidCohorts, selectedCohort]
          };
        } else {
          return tab;
        }
      });

      // Update the tabs state with the updated tabs array
      setTabs(updatedTabs);

      // Clear the cohort selection
      setSelectedCohortId(null);
    }
    };
    const handleCohortChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedCohortId(event.target.value as number);
    };

    const handleRemove = (type: 'classes' | 'cohorts', index: number) => {
    setTabs(prevTabs => {
      const newTabs = [...prevTabs];
      const currentTab = newTabs.find(tab => tab.id === activeTab);
      if (currentTab) {
        if (type === 'classes') {
          currentTab.avoidClasses.splice(index, 1);
        } else if (type === 'cohorts') {
          currentTab.avoidCohorts.splice(index, 1);
        }
      }
      return newTabs;
    });
    };

    return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'auto' }}>
      <NavBar />
      <div className="tab-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          {tabs.map(tab => (
            <div key={tab.id} className={`tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
              {tab.title}
              <button onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}>x</button>
            </div>
          ))}
          <button className="add-tab" onClick={addTab}>+</button>
        </div>
        <Button onClick={() => exportToCSV(tabs, grids)} color="primary">
          Export to CSV
        </Button>
        <Button color="primary" onClick={handleSettingsOpen} className="tab">
          Class Settings
        </Button>
      </div>
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <table style={{ width: '100%', tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th></th> {/* Empty cell at the top-left corner */}
              {console.log('grids:', grids)}
              {console.log('tabs:', tabs)}
              {activeTab !== null && grids[activeTab].days.map((day: string) => (
                <th key={day}>{day}</th>
              ))}
            </tr>
          </thead>

          {/*Inside the return statement of the TimeSlotGrid component*/}
          <tbody>
            {activeTab !== null && grids[activeTab].times.map((time: string) => (
              <tr key={time}>
                <td>{time}</td>
                {grids[activeTab].days.map((day: string) => {
                  const currentDay = day;
                  const currentStartTime = convertTo24Hour(time);
                  const activeTabData = tabs.find(tab => tab.id === activeTab);
                  const matchingAvailabilityData = (activeTabData?.availabilityData as AvailabilityDataItem[])?.find(
                    item => item.time.day === currentDay && item.time.startTime === currentStartTime
                  );

                  let backgroundColor = 'lightgreen'; // Default color for available time slots
                  if (matchingAvailabilityData) {
                    const availabilityPercentage = parseInt(matchingAvailabilityData.availability);
                    if (availabilityPercentage === 0) {
                      backgroundColor = 'red'; // Unavailable
                    } else if (availabilityPercentage < 50) {
                      backgroundColor = 'gold'; // Limited availability
                    }
                  }

                  return (
                    <td key={day} className="time-slot" style={{ backgroundColor }}> {/* part of the color coded background via availability*/}
                      {matchingAvailabilityData ? (
                        <div onClick={() => {
                          if (matchingAvailabilityData.reasons.length > 0) {
                            alert(matchingAvailabilityData.reasons.map(reason => ` Conflict: ${reason.className} - Section: ${reason.section}, Availability: ${parseFloat(reason.availability).toFixed(1)}%`).join('\n'));
                          } else {
                            alert('No conflicts');
                          }
                        }}>
                          {matchingAvailabilityData.availability}
                        </div>
                      ) : (
                        <div>
                          Add Constraints in Class Settings
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>

        </table>
      </div>
      <Dialog open={settingsOpen} onClose={handleSettingsClose}>
        <DialogTitle>Class Settings</DialogTitle>
        <DialogContent>

          <InputLabel id="tab-name-label">Potential Class Name</InputLabel>
          <input type="text" value={tabs.find(tab => tab.id === activeTab)?.title} onChange={(e) => setTabs(tabs.map(tab => tab.id === activeTab ? { ...tab, nameChange: e.target.value, title: e.target.value } : tab))} />
          <InputLabel id="day-and-time-sequence-label">Select day and time sequence</InputLabel>
          <Select
            value={tabs.find(tab => tab.id === activeTab)?.dayTimeSequence}
            onChange={(e) => setTabs(tabs.map(tab => tab.id === activeTab ? { ...tab, dayTimeSequence: e.target.value as string } : tab))}
          >
            <MenuItem value={'MWF'}>MWF - 50 Min</MenuItem>
            <MenuItem value={'TR'}>TR - 75 min</MenuItem>
          </Select><br></br>
          Select classes to avoid:<br></br>
          <Select value={selectedClassId} onChange={handleClassChange}>
            {classData.map((classItem) => (
              <MenuItem value={classItem.id} key={classItem.id}>
                {classItem.classDepartment} {classItem.classNumber}
              </MenuItem>
            ))}
          </Select><br></br>
          <Button onClick={handleAddClass}>Add Class</Button><br></br>
          <InputLabel id="cohort-selection-label">Select Cohort</InputLabel>
          <Select value={selectedCohortId} onChange={handleCohortChange}>
            {cohortData.map((cohortItem) => (
              <MenuItem value={cohortItem.id} key={cohortItem.id}>
                {cohortItem.program} - Semester {cohortItem.semesterNumber}
              </MenuItem>
            ))}
          </Select><br></br>
          <Button onClick={handleAddCohort}>Add Cohort</Button><br></br>
          <br></br>
          Avoiding:<br></br>
          {tabs.find(tab => tab.id === activeTab)?.avoidClasses.map((classItem, index) => (
            <p key={index}>
              {classItem.classDepartment} {classItem.classNumber}
              <button onClick={() => handleRemove('classes', index)}>x</button>
            </p>
          ))}
          {tabs.find(tab => tab.id === activeTab)?.avoidCohorts.map((cohortItem, index) => (
            <div key={index}>
              {cohortItem.program} - Semester {cohortItem.semesterNumber}
              <button onClick={() => handleRemove('cohorts', index)}>x</button>
            </div>
          ))}

        </DialogContent>

        <DialogActions>
          <Button onClick={handleSettingsClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSettingsSubmit} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
    );
    }

    export default TimeSlotGrid;
